import { computed, unref, watch } from 'vue'
import { v4 as uuidV4 } from 'uuid'
import { UppyService } from '../../services/uppy/uppyService'
import { useAuthStore, useCapabilityStore } from '../piniaStores'
import { TusOptions } from '@uppy/tus'
import { XHRUploadOptions } from '@uppy/xhr-upload'
import { UppyFile } from '@uppy/core'
import { useClientService } from '../clientService'
import { useGettext } from 'vue3-gettext'

interface UploadOptions {
  uppyService: UppyService
}

export function useUpload(options: UploadOptions) {
  const capabilityStore = useCapabilityStore()
  const authStore = useAuthStore()
  const clientService = useClientService()
  const language = useGettext()

  const isTusSupported = computed(() => capabilityStore.tusMaxChunkSize > 0)

  const getHeaders = () => {
    const headers: Record<string, string> = {}

    if (authStore.publicLinkPassword) {
      headers['Authorization'] =
        'Basic ' +
        Buffer.from(['public', authStore.publicLinkPassword].join(':')).toString('base64')
    } else if (authStore.accessToken && !authStore.publicLinkPassword) {
      headers['Authorization'] = 'Bearer ' + authStore.accessToken
    }

    headers['X-Request-ID'] = uuidV4()
    headers['Accept-Language'] = language.current
    headers['Initiator-ID'] = clientService.initiatorId
    return headers
  }

  const tusOptions = computed<TusOptions>(() => {
    const options: TusOptions = {
      onBeforeRequest: (req, file) =>
        new Promise((resolve) => {
          const headers = getHeaders()
          req.setHeader('Authorization', headers.Authorization)
          req.setHeader('X-Request-ID', headers['X-Request-ID'])
          req.setHeader('Accept-Language', headers['Accept-Language'])
          req.setHeader('Initiator-ID', headers['Initiator-ID'])
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
        return { 'x-oc-mtime': file?.data?.lastModified / 1000, ...getHeaders() }
      }
    }

    return options
  })

  const xhrOptions = computed<XHRUploadOptions>(() => {
    return {
      timeout: 60000,
      endpoint: '',
      headers: (file) => ({
        'x-oc-mtime': file?.data?.lastModified / 1000,
        ...getHeaders()
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
