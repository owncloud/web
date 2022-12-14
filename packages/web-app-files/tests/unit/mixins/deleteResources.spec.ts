import deleteResources from 'web-app-files/src/mixins/deleteResources'
import { mockDeep } from 'jest-mock-extended'
import { SpaceResource } from 'web-client/src/helpers'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks
} from 'web-test-helpers'

const currentFolder = {
  id: 1,
  path: '/folder'
}

const Component: any = {
  template: '<div></div>',
  mixins: [deleteResources]
}

describe('deleteResources', () => {
  describe('method "$_deleteResources_filesList_delete"', () => {
    it('should call the delete action on a resource in the file list', async () => {
      const resourcesToDelete = [{ id: 2, path: '/' }]
      const { mocks, storeOptions, wrapper } = getWrapper(currentFolder, resourcesToDelete)
      await wrapper.vm.$_deleteResources_filesList_delete()
      await wrapper.vm.$nextTick()
      expect(mocks.$router.push).toHaveBeenCalledTimes(0)
      expect(storeOptions.actions.hideModal).toHaveBeenCalledTimes(1)
    })

    it('should call the delete action on the current folder', async () => {
      const resourcesToDelete = [currentFolder]
      const { mocks, storeOptions, wrapper } = getWrapper(currentFolder, resourcesToDelete)
      await wrapper.vm.$_deleteResources_filesList_delete()
      await wrapper.vm.$nextTick()
      expect(mocks.$router.push).toHaveBeenCalledTimes(1)
      expect(storeOptions.actions.hideModal).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper(currentFolder, resourcesToDelete) {
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
    wrapper: mount(Component, {
      data: () => {
        return { resourcesToDelete: resourcesToDelete }
      },
      global: { plugins: [...defaultPlugins(), store], mocks }
    })
  }
}
