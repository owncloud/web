import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import Trashbin from '@files/src/views/spaces/Trashbin.vue'
import { createStore } from 'vuex-extensions'
import { createLocationTrash } from '../../../../src/router'
import { waitFor } from '@testing-library/dom'

const localVue = createLocalVue()
localVue.use(Vuex)

afterEach(() => jest.clearAllMocks())

describe('Trashbin', () => {
  describe('method "mounted"', () => {
    it('should change document title', async () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.loadResourcesTask.perform).toBeCalled()
      await waitFor(() => expect(document.title).toBe('Deleted files - Space - ownCloud'))
    })
  })
})

function getWrapper() {
  return mount(Trashbin, {
    localVue,
    mocks: {
      $router: {
        currentRoute: {
          ...createLocationTrash('files-trash-spaces-project'),
          meta: {
            title: 'Deleted files'
          }
        },
        resolve: (r) => {
          return { href: r.name }
        }
      },
      loadResourcesTask: {
        isRunning: false,
        perform: jest.fn()
      },
      space: {
        name: 'Space'
      },
      $gettext: jest.fn(),
      document: {
        title: ''
      }
    },
    store: createStore(Vuex.Store, {
      actions: {
        showMessage: jest.fn()
      },
      getters: {
        configuration: () => ({
          server: 'https://example.com',
          currentTheme: {
            general: {
              name: 'ownCloud'
            }
          }
        }),
        getToken: () => 'token'
      }
    }),
    stubs: {
      'trash-bin': true
    }
  })
}
