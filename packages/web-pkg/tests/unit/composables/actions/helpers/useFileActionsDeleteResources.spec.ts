import { useStore, useFileActionsDeleteResources } from '../../../../../src'
import { mockDeep } from 'jest-mock-extended'
import { FolderResource, SpaceResource } from '@ownclouders/web-client/src/helpers'
import {
  createStore,
  defaultStoreMockOptions,
  defaultComponentMocks,
  getComposableWrapper
} from 'web-test-helpers'
import { nextTick } from 'vue'

const currentFolder = {
  id: '1',
  path: '/folder'
}

describe('deleteResources', () => {
  describe('method "filesList_delete"', () => {
    it('should call the delete action on a resource in the file list', async () => {
      const { wrapper } = getWrapper({
        currentFolder,
        setup: async ({ displayDialog, filesList_delete }, { space, router, storeOptions }) => {
          await filesList_delete([{ id: '2', path: '/folder/fileToDelete.txt' }])
          await nextTick()
          expect(router.push).toHaveBeenCalledTimes(0)
        }
      })
    })

    it('should call the delete action on the current folder', async () => {
      const resourcesToDelete = [currentFolder]
      const { wrapper } = getWrapper({
        currentFolder,
        setup: async ({ displayDialog, filesList_delete }, { space, router, storeOptions }) => {
          await filesList_delete(resourcesToDelete)
          await nextTick()
          expect(router.push).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})

function getWrapper({
  currentFolder,
  setup
}: {
  currentFolder: FolderResource
  setup: (
    instance: ReturnType<typeof useFileActionsDeleteResources>,
    {
      space,
      router,
      storeOptions
    }: {
      space: SpaceResource
      router: ReturnType<typeof defaultComponentMocks>['$router']
      storeOptions: typeof defaultStoreMockOptions
    }
  ) => void
}) {
  const mocks = {
    ...defaultComponentMocks(),
    space: mockDeep<SpaceResource>()
  }

  const storeOptions = {
    ...defaultStoreMockOptions
  }
  storeOptions.modules.Files.getters.currentFolder.mockReturnValue(currentFolder)
  storeOptions.modules.Files.getters.activeFiles.mockReturnValue([])

  const store = createStore(storeOptions)
  return {
    mocks,
    storeOptions,
    wrapper: getComposableWrapper(
      () => {
        const store = useStore()
        const instance = useFileActionsDeleteResources({ store })
        setup(instance, { space: mocks.space, storeOptions, router: mocks.$router })
      },
      {
        mocks,
        provide: mocks,
        store
      }
    )
  }
}
