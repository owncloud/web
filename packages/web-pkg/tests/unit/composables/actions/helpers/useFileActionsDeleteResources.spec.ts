import { useFileActionsDeleteResources } from '../../../../../src/composables/actions'
import { mockDeep } from 'vitest-mock-extended'
import { FolderResource, Resource, SpaceResource } from '@ownclouders/web-client'
import {
  defaultComponentMocks,
  getComposableWrapper,
  useGetMatchingSpaceMock
} from 'web-test-helpers'
import { useDeleteWorker } from '../../../../../src/composables/webWorkers/deleteWorker'
import { useGetMatchingSpace } from '../../../../../src/composables/spaces/useGetMatchingSpace'

vi.mock('../../../../../src/composables/webWorkers/deleteWorker')
vi.mock('../../../../../src/composables/spaces/useGetMatchingSpace')

const currentFolder = {
  id: '1',
  path: '/folder'
}

describe('deleteResources', () => {
  describe('method "filesList_delete"', () => {
    it('should call the delete action on a resource in the file list', () => {
      const filesToDelete = [{ id: '2', path: '/folder/fileToDelete.txt' }]

      getWrapper({
        currentFolder,
        result: filesToDelete,
        setup: ({ filesList_delete }, { router }) => {
          filesList_delete(filesToDelete)

          expect(router.push).toHaveBeenCalledTimes(0)
        }
      })
    })

    it('should call the delete action on the current folder', () => {
      const resourcesToDelete = [currentFolder]
      getWrapper({
        currentFolder,
        setup: ({ filesList_delete }, { router }) => {
          filesList_delete(resourcesToDelete)

          expect(router.push).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})

function getWrapper({
  currentFolder,
  setup,
  result = []
}: {
  currentFolder: FolderResource
  setup: (
    instance: ReturnType<typeof useFileActionsDeleteResources>,
    {
      space,
      router
    }: {
      space: SpaceResource
      router: ReturnType<typeof defaultComponentMocks>['$router']
    }
  ) => void
  result?: Resource[]
}) {
  const mocks = {
    ...defaultComponentMocks(),
    space: mockDeep<SpaceResource>()
  }
  mocks.$clientService.webdav.deleteFile.mockResolvedValue(undefined)

  vi.mocked(useDeleteWorker).mockReturnValue({
    startWorker: vi.fn().mockImplementation((_, callback) => {
      callback({ successful: result, failed: [] })
    })
  })

  vi.mocked(useGetMatchingSpace).mockImplementation(() =>
    useGetMatchingSpaceMock({
      getInternalSpace: () => mocks.space
    })
  )

  return {
    mocks,
    wrapper: getComposableWrapper(
      () => {
        const instance = useFileActionsDeleteResources()
        setup(instance, { space: mocks.space, router: mocks.$router })
      },
      {
        mocks,
        provide: mocks,
        pluginOptions: { piniaOptions: { resourcesStore: { currentFolder } } }
      }
    )
  }
}
