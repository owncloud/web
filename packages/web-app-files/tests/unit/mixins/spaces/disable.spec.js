import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import disable from '@files/src/mixins/spaces/actions/disable.js'
import { createLocationSpaces } from '../../../../src/router'
import mockAxios from 'jest-mock-axios'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('disable', () => {
  const Component = {
    render() {},
    mixins: [disable]
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
          showMessage: jest.fn(),
          setModalInputErrorMessage: jest.fn()
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

  describe('isEnabled property', () => {
    it('should be false when no resource given', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.$_disable_items[0].isEnabled({ resources: [] })).toBe(false)
    })
    it('should be true when the space is not disabled', () => {
      const wrapper = getWrapper()
      expect(
        wrapper.vm.$_disable_items[0].isEnabled({ resources: [{ id: 1, disabled: false }] })
      ).toBe(true)
    })
    it('should be false when the space is disabled', () => {
      const wrapper = getWrapper()
      expect(
        wrapper.vm.$_disable_items[0].isEnabled({ resources: [{ id: 1, disabled: true }] })
      ).toBe(false)
    })
  })

  describe('method "$_disable_trigger"', () => {
    it('should trigger the disable modal window', async () => {
      const wrapper = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_disable_trigger({ resources: [{ id: 1 }] })

      expect(spyCreateModalStub).toHaveBeenCalledTimes(1)
    })
    it('should not trigger the disable modal window without any resource', async () => {
      const wrapper = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_disable_trigger({ resources: [] })

      expect(spyCreateModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('method "$_disable_disableSpace"', () => {
    it('should hide the modal on success', async () => {
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.resolve()
      })

      const wrapper = getWrapper()
      const hideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      await wrapper.vm.$_disable_disableSpace(1)

      expect(hideModalStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.reject(new Error())
      })

      const wrapper = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_disable_disableSpace(1)

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
  })
})
