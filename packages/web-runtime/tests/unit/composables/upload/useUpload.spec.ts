import { useUpload } from 'web-runtime/src/composables/upload'
import { createWrapper } from './spec'
import { UppyService } from '../../../../src/services/uppyService'

describe('useUpload', () => {
  it('should be valid', () => {
    expect(useUpload).toBeDefined()
  })

  it('should create non-existent folders before upload', async () => {
    const createFolderMock = jest.fn()

    const wrapper = createWrapper(() => {
      const uppyService = new UppyService()
      const { createDirectoryTree } = useUpload({ uppyService })
      return { createDirectoryTree }
    }, createFolderMock)

    const uppyResources = [
      {
        source: 'source',
        name: 'file1',
        type: 'type',
        data: new Blob(),
        meta: {
          currentFolder: 'currentFolder',
          relativeFolder: 'l1/l2/l3',
          relativePath: 'relativePath',
          route: { name: 'files-personal' },
          tusEndpoint: 'tusEndpoint',
          webDavBasePath: 'webDavBasePath'
        }
      },
      {
        source: 'source',
        name: 'file2',
        type: 'type',
        data: new Blob(),
        meta: {
          currentFolder: 'currentFolder',
          relativeFolder: 'l1/l2/l3',
          relativePath: 'relativePath',
          route: { name: 'files-personal' },
          tusEndpoint: 'tusEndpoint',
          webDavBasePath: 'webDavBasePath'
        }
      },
      {
        source: 'source',
        name: 'file3',
        type: 'type',
        data: new Blob(),
        meta: {
          currentFolder: 'currentFolder',
          relativeFolder: 'l1/l2/anotherFolder',
          relativePath: 'relativePath',
          route: { name: 'files-personal' },
          tusEndpoint: 'tusEndpoint',
          webDavBasePath: 'webDavBasePath'
        }
      }
    ]

    await wrapper.vm.createDirectoryTree(uppyResources)
    expect(createFolderMock).toHaveBeenCalledTimes(4)
  })
})
