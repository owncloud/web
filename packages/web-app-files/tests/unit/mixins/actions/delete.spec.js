import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import Delete from '@files/src/mixins/actions/delete.js'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('delete', () => {
  const Component = {
    render() {},
    mixins: [Delete]
  }

  function getWrapper() {
    return mount(Component, {
      localVue,
      mocks: {
        $route: {
          name: 'files-personal'
        },
        $router: [],
        $client: { files: { list: jest.fn(() => []) } },
        $gettextInterpolate: () => 'title',
        publicPage: () => false
      },
      store: createStore(Vuex.Store, {
        modules: {
          Files: {
            namespaced: true,
            getters: {
              currentFolder: () => {
                return { id: 1, path: '/folder' }
              },
              files: () => [{ name: 'file1' }]
            },
            actions: {
              deleteFile: jest.fn(() => {})
            }
          }
        },
        actions: {
          createModal: jest.fn(),
          hideModal: jest.fn(),
          toggleModalConfirmButton: jest.fn(),
          showMessage: jest.fn()
        }
      })
    })
  }

  describe('computed property "$_delete_items"', () => {
    describe('isEnabled property of returned element', () => {
      it.each([
        { resources: [{ canBeDeleted: () => true }], expectedStatus: true },
        { resources: [{ canBeDeleted: () => false }], expectedStatus: false }
      ])('should be set correctly', (inputData) => {
        const wrapper = getWrapper()
        const resources = inputData.resources
        expect(wrapper.vm.$_delete_items[0].isEnabled({ resources })).toBe(inputData.expectedStatus)
      })
    })
  })
})
