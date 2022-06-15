import { useUploadHelpers } from '../../../../src/composables/upload'
import { createWrapper } from './spec'

describe('useUploadHelpers', () => {
  const currentPathMock = 'path'
  const uploadPathMock = 'path'

  it('should be valid', () => {
    expect(useUploadHelpers).toBeDefined()
  })

  it('returns the correct current path', () => {
    createWrapper(
      () => {
        const { currentPath } = useUploadHelpers()
        expect(currentPath.value).toBe(`${currentPathMock}/`)
      },
      { currentItem: currentPathMock, fileUrl: uploadPathMock }
    )
  })

  it('returns the correct uploadPath', () => {
    createWrapper(
      () => {
        const { uploadPath } = useUploadHelpers()
        expect(uploadPath.value).toBe(uploadPathMock)
      },
      { currentItem: currentPathMock, fileUrl: uploadPathMock }
    )
  })

  it('converts normal files to uppy resources', () => {
    createWrapper(
      () => {
        const fileName = 'filename'
        const { inputFilesToUppyFiles } = useUploadHelpers()
        const uppyResources = inputFilesToUppyFiles([{ name: fileName }])
        expect(uppyResources.length).toBe(1)

        for (const uppyResource of uppyResources) {
          expect(uppyResource.name).toBe(fileName)
          expect(uppyResource.meta).not.toBeUndefined()
        }
      },
      { currentItem: currentPathMock, fileUrl: uploadPathMock }
    )
  })
})
