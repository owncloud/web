import { useStore } from '../store'
import { useAccessToken, usePublicLinkContext, usePublicLinkPassword } from '../authContext'
import {
  useCapabilityFilesTusExtension,
  useCapabilityFilesTusSupportHttpMethodOverride,
  useCapabilityFilesTusSupportMaxChunkSize
} from '../capability'
import { computed, unref, watch } from 'vue'
import { UppyService } from '../../services/uppy/uppyService'
import { v4 as uuidV4 } from 'uuid'
import { useGettext } from 'vue3-gettext'

interface UploadOptions {
  uppyService: UppyService
}

export function useUpload(options: UploadOptions) {
  const store = useStore()
  const { current: currentLanguage } = useGettext()
  const publicLinkPassword = usePublicLinkPassword({ store })
  const isPublicLinkContext = usePublicLinkContext({ store })
  const accessToken = useAccessToken({ store })

  const tusHttpMethodOverride = useCapabilityFilesTusSupportHttpMethodOverride()
  const tusMaxChunkSize = useCapabilityFilesTusSupportMaxChunkSize()
  const tusExtension = useCapabilityFilesTusExtension()

  const headers = computed((): { [key: string]: string } => {
    const headers = { 'Accept-Language': currentLanguage }
    if (unref(isPublicLinkContext)) {
      const password = unref(publicLinkPassword)
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
      Authorization: 'Bearer ' + unref(accessToken)
    }
  })

  const uppyOptions = computed(() => {
    const isTusSupported = unref(tusMaxChunkSize) > 0

    return {
      isTusSupported,
      onBeforeRequest: (req) => {
        req.setHeader('Authorization', unref(headers).Authorization)
        req.setHeader('X-Request-ID', uuidV4())
        req.setHeader('Accept-Language', unref(headers)['Accept-Language'])
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
        tusMaxChunkSize: unref(tusMaxChunkSize),
        tusHttpMethodOverride: unref(tusHttpMethodOverride),
        tusExtension: unref(tusExtension)
      }),
      ...(!isTusSupported && {
        xhrTimeout: store.getters.configuration?.options?.upload?.xhr?.timeout || 60000
      })
    }
  })

  watch(
    uppyOptions,
    () => {
      if (unref(uppyOptions).isTusSupported) {
        options.uppyService.useTus(unref(uppyOptions) as any)
        return
      }
      options.uppyService.useXhr(unref(uppyOptions) as any)
    },
    { immediate: true }
  )
}
