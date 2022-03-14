import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import DeletedFiles from '@files/src/mixins/spaces/actions/deletedFiles.js'
import { createLocationSpaces, createLocationTrash } from '../../../../src/router'
import { buildSpace } from '../../../../src/helpers/resources'

const localVue = createLocalVue()
localVue.use(Vuex)

const Component = {
  render() {},
  mixins: [DeletedFiles]
}

describe('delete', () => {
  afterEach(() => jest.clearAllMocks())

  describe('isEnabled property', () => {
    it('should be false when not resource given', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.$_deletedFiles_items[0].isEnabled({ resources: [] })).toBe(false)
    })
    it('should be true when resource is given', () => {
      const spaceMock = {
        id: '1'
      }
      const wrapper = getWrapper()
      expect(
        wrapper.vm.$_deletedFiles_items[0].isEnabled({ resources: [buildSpace(spaceMock)] })
      ).toBe(true)
    })
  })

  describe('method "$_deletedFiles_trigger"', () => {
    it('should trigger route change', async () => {
      const spaceMock = {
        id: '1'
      }

      const wrapper = getWrapper()
      await wrapper.vm.$_deletedFiles_trigger({ resources: [buildSpace(spaceMock)] })

      expect(wrapper.vm.$router.push).toHaveBeenCalledWith(
        createLocationTrash('files-trash-spaces-project', {
          params: {
            spaceId: spaceMock.id
          }
        })
      )
    })
  })
})

function getWrapper() {
  return mount(Component, {
    localVue,
    mocks: {
      $router: {
        currentRoute: createLocationSpaces('files-spaces-projects'),
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
