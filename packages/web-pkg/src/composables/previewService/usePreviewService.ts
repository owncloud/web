import { useService } from 'web-pkg/src/composables/service'
import { PreviewService } from 'web-pkg/src/services/preview/previewService'

export const usePreviewService = (): PreviewService => {
  return useService('$previewService')
}
