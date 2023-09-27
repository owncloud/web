import { useService } from '@ownclouders/web-pkg/src/composables/service'
import { PreviewService } from '@ownclouders/web-pkg/src/services/preview/previewService'

export const usePreviewService = (): PreviewService => {
  return useService('$previewService')
}
