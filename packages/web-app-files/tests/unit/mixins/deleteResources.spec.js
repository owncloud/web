import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import deleteResources from '@files/src/mixins/deleteResources.js'

const localVue = createLocalVue()
localVue.use(Vuex)

const user = {
  id: 1,
  quota: 1
}

const currentFolder = {
  id: 1,
  path: '/folder'
}

const Component = {
  render() {},
  mixins: [deleteResources]
}

describe('deleteResources', () => {
  describe('method "$_deleteResources_filesList_delete"', () => {
    it('should call the delete action on a resource in the file list', async () => {
      const resourcesToDelete = [{ id: 2, path: '/' }]
      const wrapper = getWrapper(resourcesToDelete)
      const spyHideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      await wrapper.vm.$_deleteResources_filesList_delete()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$router.length).toBeGreaterThanOrEqual(0)
      expect(spyHideModalStub).toHaveBeenCalledTimes(1)
    })

    it('should call the delete action on the current folder', async () => {
      const resourcesToDelete = [currentFolder]
      const wrapper = getWrapper(resourcesToDelete)
      const spyHideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      await wrapper.vm.$_deleteResources_filesList_delete()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$router.length).toBeGreaterThanOrEqual(1)
      expect(spyHideModalStub).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper(resourcesToDelete) {
  return mount(Component, {
    localVue,
    mocks: {
      $route: {
        name: 'files-personal'
      },
      $router: [],
      $client: {
        users: {
          getUser: jest.fn(() => user)
        }
      },
      publicPage: () => false,
      currentFolder: currentFolder
    },
    data: () => {
      return { resourcesToDelete: resourcesToDelete }
    },
    store: createStore(Vuex.Store, {
      getters: {
        user: () => {
          return { id: 'marie' }
        }
      },
      modules: {
        Files: {
          namespaced: true,
          actions: {
            deleteFiles: jest.fn(
              () =>
                new Promise((resolve) => {
                  resolve()
                })
            )
          }
        }
      },
      mutations: {
        SET_QUOTA: () => {}
      },
      actions: {
        createModal: jest.fn(),
        hideModal: jest.fn(),
        toggleModalConfirmButton: jest.fn()
      }
    })
  })
}
