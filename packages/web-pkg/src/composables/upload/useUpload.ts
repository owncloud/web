import { computed, unref, watch } from 'vue'
import { UppyService } from '../../services/uppy/uppyService'
import { useCapabilityStore } from '../piniaStores'
import { TusOptions } from '@uppy/tus'
import { XHRUploadOptions } from '@uppy/xhr-upload'
import { UppyFile } from '@uppy/core'
import { useRequestHeaders } from '../requestHeaders'

interface UploadOptions {
  uppyService: UppyService
}

export function useUpload(options: UploadOptions) {
  const capabilityStore = useCapabilityStore()
  const { headers } = useRequestHeaders()

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
      timeout: 60000,
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
