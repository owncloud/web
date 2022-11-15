import { useUploadHelpers } from '../../../../src/composables/upload'
import { createWrapper } from './spec'
import { mockDeep } from 'jest-mock-extended'
import { SpaceResource } from 'web-client/src/helpers'
import { ComputedRef, computed } from 'vue'

describe('useUploadHelpers', () => {
  const currentPathMock = 'path'
  const uploadPathMock = 'path'

  it('should be valid', () => {
    expect(useUploadHelpers).toBeDefined()
  })

  it('converts normal files to uppy resources', () => {
    createWrapper(
      () => {
        const fileName = 'filename'
        const { inputFilesToUppyFiles } = useUploadHelpers({
          space: mockDeep<ComputedRef<SpaceResource>>(),
          currentFolder: computed(() => '')
        })
        const uppyResources = inputFilesToUppyFiles([{ name: fileName }])
        expect(uppyResources.length).toBe(1)

        for (const uppyResource of uppyResources) {
          // TODO: this would probably need some more checks on props and a proper space mock.
          expect(uppyResource.name).toBe(fileName)
          expect(uppyResource.meta).not.toBeUndefined()
        }
      },
      { currentItem: currentPathMock, fileUrl: uploadPathMock }
    )
  })
})
