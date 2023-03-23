import { useService } from 'web-pkg/src/composables/service'
import { ThumbnailService } from '../../services'

export const useThumbnailService = (): ThumbnailService => {
  return useService('$thumbnailService')
}
