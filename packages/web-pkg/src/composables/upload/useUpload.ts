import { computed, unref, watch } from 'vue'
import { UppyService } from '../../services/uppy/uppyService'
import { v4 as uuidV4 } from 'uuid'
import { useGettext } from 'vue3-gettext'
import { useAuthStore, useCapabilityStore, useConfigStore } from '../piniaStores'
import { useClientService } from '../clientService'
import { Auth } from '../../services'
import { TusOptions } from '@uppy/tus'
import { XHRUploadOptions } from '@uppy/xhr-upload'
import { UppyFile } from '@uppy/core'

interface UploadOptions {
  uppyService: UppyService
}

export function useUpload(options: UploadOptions) {
  const configStore = useConfigStore()
  const capabilityStore = useCapabilityStore()
  const clientService = useClientService()
  const { current: currentLanguage } = useGettext()
  const authStore = useAuthStore()

  const headers = computed((): { [key: string]: string } => {
    const auth = new Auth({
      accessToken: authStore.accessToken,
      publicLinkToken: authStore.publicLinkToken,
      publicLinkPassword: authStore.publicLinkPassword
    })

    return {
      'Accept-Language': currentLanguage,
      'Initiator-ID': clientService.initiatorId,
      'X-Request-ID': uuidV4(),
      ...auth.getHeaders()
    }
  })

  const isTusSupported = computed(() => capabilityStore.tusMaxChunkSize > 0)

  const tusOptions = computed<TusOptions>(() => {
    const options: TusOptions = {
      onBeforeRequest: (req, file) =>
        new Promise((resolve) => {
          req.setHeader('Authorization', unref(headers).Authorization)
          req.setHeader('X-Request-ID', unref(headers)['X-Request-ID'])
          req.setHeader('Accept-Language', unref(headers)['Accept-Language'])
          req.setHeader('Initiator-ID', unref(headers)['Initiator-ID'])
          if (file?.isRemote) {
            req.setHeader('x-oc-mtime', (file?.data?.lastModified / 1000).toString())
          }
          resolve()
        }),
      chunkSize: capabilityStore.tusMaxChunkSize || Infinity,
      overridePatchMethod: capabilityStore.tusHttpMethodOverride,
      uploadDataDuringCreation: capabilityStore.tusExtension.includes('creation-with-upload')
    }

    // FIXME: remove if cloud upload still works without this
    ;(options as any)['headers'] = (file: UppyFile) => {
      if (!!file.xhrUpload || file?.isRemote) {
        return { 'x-oc-mtime': file?.data?.lastModified / 1000, ...unref(headers) }
      }
    }

    return options
  })

  const xhrOptions = computed<XHRUploadOptions>(() => {
    return {
      timeout: configStore.options.upload?.xhr?.timeout || 60000,
      endpoint: '',
      headers: (file) => ({
        'x-oc-mtime': file?.data?.lastModified / 1000,
        ...unref(headers)
      })
    }
  })

  watch(
    [tusOptions, xhrOptions],
    () => {
      if (unref(isTusSupported)) {
        options.uppyService.useTus(unref(tusOptions))
        return
      }
      options.uppyService.useXhr(unref(xhrOptions))
    },
    { immediate: true }
  )
}
