import { computed, unref, watch } from 'vue'
import { UppyService } from '../../services/uppy/uppyService'
import { v4 as uuidV4 } from 'uuid'
import { useGettext } from 'vue3-gettext'
import { useAuthStore, useCapabilityStore, useClientStore, useConfigStore } from '../piniaStores'

interface UploadOptions {
  uppyService: UppyService
}

export function useUpload(options: UploadOptions) {
  const configStore = useConfigStore()
  const capabilityStore = useCapabilityStore()
  const clientStore = useClientStore()
  const { current: currentLanguage } = useGettext()
  const authStore = useAuthStore()

  const headers = computed((): { [key: string]: string } => {
    const headers = {
      'Accept-Language': currentLanguage,
      'Initiator-ID': clientStore.clientInitiatorId
    }
    if (authStore.publicLinkContextReady) {
      const password = authStore.publicLinkPassword
      if (password) {
        return {
          ...headers,
          Authorization: 'Basic ' + Buffer.from('public:' + password).toString('base64')
        }
      }

      return headers
    }
    return {
      ...headers,
      Authorization: 'Bearer ' + authStore.accessToken
    }
  })

  const uppyOptions = computed(() => {
    const isTusSupported = capabilityStore.tusMaxChunkSize > 0

    return {
      isTusSupported,
      onBeforeRequest: (req) => {
        req.setHeader('Authorization', unref(headers).Authorization)
        req.setHeader('X-Request-ID', uuidV4())
        req.setHeader('Accept-Language', unref(headers)['Accept-Language'])
        req.setHeader('Initiator-ID', unref(headers)['Initiator-ID'])
      },
      headers: (file) =>
        !!file.xhrUpload || file?.isRemote
          ? {
              'x-oc-mtime': file?.data?.lastModified / 1000,
              'X-Request-ID': uuidV4(),
              ...unref(headers)
            }
          : {},
      ...(isTusSupported && {
        tusMaxChunkSize: capabilityStore.tusMaxChunkSize,
        tusHttpMethodOverride: capabilityStore.tusHttpMethodOverride,
        tusExtension: capabilityStore.tusExtension
      }),
      ...(!isTusSupported && {
        xhrTimeout: configStore.options.upload?.xhr?.timeout || 60000
      })
    }
  })

  watch(
    uppyOptions,
    () => {
      if (unref(uppyOptions).isTusSupported) {
        options.uppyService.useTus(unref(uppyOptions))
        return
      }
      options.uppyService.useXhr(unref(uppyOptions))
    },
    { immediate: true }
  )
}
