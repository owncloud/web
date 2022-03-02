import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import EditDescription from '@files/src/mixins/spaces/actions/editDescription.js'
import { createLocationSpaces } from '../../../../src/router'
import mockAxios from 'jest-mock-axios'

const localVue = createLocalVue()
localVue.use(Vuex)

const Component = {
  render() {},
  mixins: [EditDescription]
}

describe('editDescription', () => {
  afterEach(() => jest.clearAllMocks())

  describe('method "$_editDescription_trigger"', () => {
    it('should trigger the editDescription modal window with one resource', async () => {
      const wrapper = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_editDescription_trigger({ resources: [{ id: 1 }] })

      expect(spyCreateModalStub).toHaveBeenCalledTimes(1)
    })
    it('should not trigger the editDescription modal window with no resource', async () => {
      const wrapper = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_editDescription_trigger({ resources: [] })

      expect(spyCreateModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('method "$_editDescription_editDescriptionSpace"', () => {
    it('should hide the modal on success', async () => {
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.resolve()
      })
      const wrapper = getWrapper()
      const hideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      await wrapper.vm.$_editDescription_editDescriptionSpace(1)

      expect(hideModalStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.reject(new Error())
      })
      const wrapper = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_editDescription_editDescriptionSpace(1)

      expect(showMessageStub).toHaveBeenCalledTimes(1)
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
        }
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
            UPDATE_RESOURCE_FIELD: jest.fn()
          }
        }
      }
    })
  })
}
