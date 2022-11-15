import { createLocalVue, mount } from '@vue/test-utils'
import { createStore } from 'vuex-extensions'
import CreateSpace from '../../../../src/components/AppBar/CreateSpace.vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'

const localVue = createLocalVue()
localVue.use(VueRouter)
localVue.use(DesignSystem)
localVue.use(Vuex)

describe('CreateSpace component', () => {
  it('should show the "create new space" modal', async () => {
    const wrapper = getMountedWrapper()
    const createModalStub = jest.spyOn(wrapper.vm, 'createModal')
    const button = wrapper.find('#new-space-menu-btn')
    expect(button.exists()).toBeTruthy()
    await button.trigger('click')

    expect(createModalStub).toHaveBeenCalledTimes(1)
  })

  it('should show an error message when trying to create a space with an empty name', () => {
    const wrapper = getMountedWrapper()
    wrapper.vm.setModalInputErrorMessage = jest.fn()

    const spyInputErrorMessageStub = jest.spyOn(wrapper.vm, 'setModalInputErrorMessage')
    wrapper.vm.checkSpaceName('')

    expect(spyInputErrorMessageStub).toHaveBeenCalledWith('Space name cannot be empty')
  })

  it('should throw an error with an space name longer than 255 characters', async () => {
    const wrapper = getMountedWrapper()
    wrapper.vm.setModalInputErrorMessage = jest.fn()

    const spyInputErrorMessageStub = jest.spyOn(wrapper.vm, 'setModalInputErrorMessage')
    await wrapper.vm.checkSpaceName('n'.repeat(256))

    expect(spyInputErrorMessageStub).toHaveBeenCalledTimes(1)
  })

  it.each(['/', '\\', '.', ':', '?', '*', '"', '>', '<', '|'])(
    'should show an error message when trying to create a space with a special character',
    (specialChar) => {
      const wrapper = getMountedWrapper()
      wrapper.vm.setModalInputErrorMessage = jest.fn()

      const spyInputErrorMessageStub = jest.spyOn(wrapper.vm, 'setModalInputErrorMessage')
      wrapper.vm.checkSpaceName(specialChar)

      expect(spyInputErrorMessageStub).toHaveBeenCalledTimes(1)
    }
  )
})

function getMountedWrapper() {
  return mount(CreateSpace, {
    localVue,
    store: createStore(Vuex.Store, {
      getters: {
        configuration: () => ({
          server: 'https://example.com/'
        })
      },
      actions: {
        createModal: jest.fn()
      }
    }),
    stubs: {
      translate: true,
      'oc-icon': true
    },
    directives: {
      'oc-tooltip': jest.fn()
    }
  })
}
