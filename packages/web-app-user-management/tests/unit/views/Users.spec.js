import { createLocalVue, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex-extensions'
import Users from '../../../src/views/Users'
import Vuex from 'vuex'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Users view', () => {
  describe('method "createUser"', () => {
    it('should hide the modal and show message on success', async () => {
      const wrapper = getMountedWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleCreateUserModalStub = jest.spyOn(wrapper.vm, 'toggleCreateUserModal')
      await wrapper.vm.createUser({ displayName: 'jan' })

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleCreateUserModalStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = getMountedWrapper({ resolveCreateUser: false })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleCreateUserModalStub = jest.spyOn(wrapper.vm, 'toggleCreateUserModal')
      await wrapper.vm.createUser()

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleCreateUserModalStub).toHaveBeenCalledTimes(0)
    })
  })
})

function getMountedWrapper({ resolveCreateUser = true } = {}) {
  return shallowMount(Users, {
    localVue,
    store: createStore(Vuex.Store, {
      actions: {
        showMessage: jest.fn()
      }
    }),
    mocks: {
      $gettext: jest.fn(),
      loadResourcesTask: {
        isRunning: false,
        perform: jest.fn()
      },
      graphClient: {
        users: {
          createUser: () => (resolveCreateUser ? Promise.resolve() : Promise.reject(new Error('')))
        }
      },
      users: [
        {
          id: '1'
        }
      ]
    },
    stubs: {
      'create-user-modal': true,
      'delete-user-modal': true,
      'app-loading-spinner': true,
      'no-content-message': true,
      'oc-breadcrumb': true,
      'oc-button': true,
      'oc-icon': true,
      translate: true
    }
  })
}
