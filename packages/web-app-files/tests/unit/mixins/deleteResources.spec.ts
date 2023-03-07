import { useDeleteResources } from 'web-app-files/src/mixins/deleteResources'
import { mockDeep } from 'jest-mock-extended'
import { FolderResource, Resource, SpaceResource } from 'web-client/src/helpers'
import {
  createStore,
  defaultStoreMockOptions,
  defaultComponentMocks,
  getComposableWrapper
} from 'web-test-helpers'
import { useStore } from 'web-pkg/src'

const currentFolder = {
  id: 1,
  path: '/folder'
}

describe('deleteResources', () => {
  describe('method "$_deleteResources_filesList_delete"', () => {
    it.skip('should call the delete action on a resource in the file list', async () => {
      const resourcesToDelete = [{ id: 2, path: '/' }]
      const { mocks, storeOptions, wrapper } = getWrapper({
        currentFolder,
        resourcesToDelete,
        setup: async (instance) => {
          await wrapper.vm.$_deleteResources_filesList_delete()
          await wrapper.vm.$nextTick()
          expect(mocks.$router.push).toHaveBeenCalledTimes(0)
          expect(storeOptions.actions.hideModal).toHaveBeenCalledTimes(1)
        }
      })
    })

    it.skip('should call the delete action on the current folder', async () => {
      const resourcesToDelete = [currentFolder]
      const { mocks, storeOptions, wrapper } = getWrapper({
        currentFolder,
        resourcesToDelete,
        setup: async (instance) => {
          await wrapper.vm.$_deleteResources_filesList_delete()
          await wrapper.vm.$nextTick()
          expect(mocks.$router.push).toHaveBeenCalledTimes(1)
          expect(storeOptions.actions.hideModal).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})

function getWrapper({
  currentFolder,
  resourcesToDelete,
  setup
}: {
  currentFolder: FolderResource
  resourcesToDelete: Resource[]
  setup: (instance: ReturnType<typeof useDeleteResources>) => void
}) {
  const mocks = {
    ...defaultComponentMocks(),
    space: mockDeep<SpaceResource>()
  }

  const storeOptions = {
    ...defaultStoreMockOptions
  }
  storeOptions.modules.Files.getters.currentFolder.mockReturnValue(currentFolder)

  const store = createStore(storeOptions)
  return {
    mocks,
    storeOptions,
    wrapper: getComposableWrapper(
      () => {
        const store = useStore()
        const instance = useDeleteResources({ store })
        setup(instance)
      },
      {
        mocks,
        store
      }
    )
  }
}
