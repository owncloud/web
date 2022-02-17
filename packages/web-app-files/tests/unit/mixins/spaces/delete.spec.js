import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import Delete from '@files/src/mixins/spaces/actions/delete.js'
import { createLocationSpaces } from '../../../../src/router'
import mockAxios from 'jest-mock-axios'

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
              REMOVE_FILE: jest.fn()
            }
          }
        }
      })
    })
  }

  describe('isEnabled property', () => {
    it('should be false when not resource given', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.$_delete_items[0].isEnabled({ resources: [] })).toBe(false)
    })
    it('should be false when the space is not disabled', () => {
      const wrapper = getWrapper()
      expect(
        wrapper.vm.$_delete_items[0].isEnabled({ resources: [{ id: 1, disabled: false }] })
      ).toBe(false)
    })
    it('should be true when the space is disabled', () => {
      const wrapper = getWrapper()
      expect(
        wrapper.vm.$_delete_items[0].isEnabled({ resources: [{ id: 1, disabled: true }] })
      ).toBe(true)
    })
  })

  describe('method "$_delete_trigger"', () => {
    it('should trigger the delete modal window', async () => {
      const wrapper = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_delete_trigger({ resources: [{ id: 1 }] })

      expect(spyCreateModalStub).toHaveBeenCalledTimes(1)
    })
    it('should not trigger the delete modal window without any resource', async () => {
      const wrapper = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_delete_trigger({ resources: [] })

      expect(spyCreateModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('method "$_delete_deleteSpace"', () => {
    it('should hide the modal and show message on success', async () => {
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.resolve()
      })
      const wrapper = getWrapper()
      const hideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_delete_deleteSpace(1)

      expect(hideModalStub).toHaveBeenCalledTimes(1)
      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.reject(new Error())
      })
      const wrapper = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_delete_deleteSpace(1)

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
  })
})
