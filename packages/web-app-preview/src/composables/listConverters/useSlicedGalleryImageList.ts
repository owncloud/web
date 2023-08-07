import { MediaGalleryFile } from 'web-app-preview/src/helpers'

export const useSlicedGalleryImageList = (
  mediafiles: MediaGalleryFile[],
  activeIndex: number
): MediaGalleryFile[] => {
  const length = mediafiles.length
  switch (length) {
    case 0:
      return [undefined, undefined, undefined, undefined, undefined]
    case 1:
      return [undefined, undefined, mediafiles[activeIndex], undefined, undefined]
    case 2:
      return [
        undefined,
        undefined,
        mediafiles[activeIndex],
        mediafiles[(activeIndex + 1) % length],
        undefined
      ]
    case 3:
      return [
        undefined,
        mediafiles[
          (activeIndex - 1) % length < 0
            ? mediafiles.length + ((activeIndex - 1) % length)
            : (activeIndex - 1) % length
        ],
        mediafiles[activeIndex],
        mediafiles[(activeIndex + 1) % length],
        undefined
      ]
    case 4:
      return [
        mediafiles[
          (activeIndex - 2) % length < 0
            ? mediafiles.length + ((activeIndex - 2) % length)
            : (activeIndex - 2) % length
        ],
        mediafiles[
          (activeIndex - 1) % length < 0
            ? mediafiles.length + ((activeIndex - 1) % length)
            : (activeIndex - 1) % length
        ],
        mediafiles[activeIndex],
        mediafiles[(activeIndex + 1) % length],
        undefined
      ]
    default:
      return [
        mediafiles[
          (activeIndex - 2) % length < 0
            ? mediafiles.length + ((activeIndex - 2) % length)
            : (activeIndex - 2) % length
        ],
        mediafiles[
          (activeIndex - 1) % length < 0
            ? mediafiles.length + ((activeIndex - 1) % length)
            : (activeIndex - 1) % length
        ],
        mediafiles[activeIndex],
        mediafiles[(activeIndex + 1) % length],
        mediafiles[(activeIndex + 2) % length]
      ]
  }
}
