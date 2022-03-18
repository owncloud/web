import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import Navigate from '@files/src/mixins/spaces/actions/navigate.js'
import { createLocationSpaces, createLocationTrash } from '../../../../src/router'

const localVue = createLocalVue()
localVue.use(Vuex)

const Component = {
  render() {},
  mixins: [Navigate]
}

describe('navigate', () => {
  afterEach(() => jest.clearAllMocks())

  describe('isEnabled property', () => {
    it('should be true when no resource given', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.$_navigate_space_items[0].isEnabled({ resources: [] })).toBe(true)
    })
    it('should be false when resource is given', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.$_navigate_space_items[0].isEnabled({ resources: [{}] })).toBe(false)
    })
    it('should be false when location is invalid', () => {
      const wrapper = getWrapper({ invalidLocation: true })
      expect(wrapper.vm.$_navigate_space_items[0].isEnabled({ resources: [] })).toBe(false)
    })
  })

  describe('method "$_navigate_space_trigger"', () => {
    it('should trigger route change', async () => {
      const wrapper = getWrapper()
      await wrapper.vm.$_navigate_space_trigger()

      expect(wrapper.vm.$router.push).toHaveBeenCalledWith(
        createLocationSpaces('files-spaces-project', {
          params: {
            storageId: wrapper.vm.$router.currentRoute.params.storageId
          }
        })
      )
    })
  })
})

function getWrapper({ invalidLocation = false } = {}) {
  return mount(Component, {
    localVue,
    mocks: {
      $router: {
        currentRoute: invalidLocation
          ? createLocationTrash('files-trash-personal')
          : createLocationTrash('files-trash-spaces-project', { params: { storageId: '1' } }),
        resolve: (r) => {
          return { href: r.name }
        },
        push: jest.fn()
      },
      $gettext: jest.fn()
    },
    store: createStore(Vuex.Store, {
      actions: {
        createModal: jest.fn(),
        hideModal: jest.fn(),
        showMessage: jest.fn()
      },
      getters: {
        configuration: () => ({
          server: 'https://example.com'
        }),
        getToken: () => 'token'
      },
      modules: {
        Files: {
          namespaced: true,
          mutations: {
            REMOVE_FILE: jest.fn()
          }
        }
      }
    })
  })
}
