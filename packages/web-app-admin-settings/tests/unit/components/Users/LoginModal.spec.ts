import LoginModal from '../../../../src/components/Users/LoginModal.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  mockAxiosResolve,
  shallowMount
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { User } from '@ownclouders/web-client/src/generated'
import { eventBus } from '@ownclouders/web-pkg'

describe('LoginModal', () => {
  it('renders the input including two options', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('shows a warning when the current user is being selected', () => {
    const { wrapper } = getWrapper([mock<User>({ id: '1' })])
    expect(wrapper.findComponent<any>('oc-select-stub').props('warningMessage')).toBeDefined()
  })
  describe('method "onConfirm"', () => {
    it('updates the login for all given users', async () => {
      const users = [mock<User>(), mock<User>()]
      const { wrapper, mocks, storeOptions } = getWrapper(users)
      mocks.$clientService.graphAuthenticated.users.editUser.mockResolvedValue(
        mockAxiosResolve({ id: 'e3515ffb-d264-4dfc-8506-6c239f6673b5' })
      )
      mocks.$clientService.graphAuthenticated.users.getUser.mockResolvedValue(
        mockAxiosResolve({ id: 'e3515ffb-d264-4dfc-8506-6c239f6673b5' })
      )

      const eventSpy = jest.spyOn(eventBus, 'publish')

      await wrapper.vm.onConfirm()
      expect(storeOptions.actions.showMessage).toHaveBeenCalled()
      expect(eventSpy).toHaveBeenCalled()
      expect(mocks.$clientService.graphAuthenticated.users.editUser).toHaveBeenCalledTimes(
        users.length
      )
    })
    it('omits the currently logged in user', async () => {
      const users = [mock<User>({ id: '1' }), mock<User>()]
      const { wrapper, mocks } = getWrapper(users)
      mocks.$clientService.graphAuthenticated.users.editUser.mockResolvedValue(
        mockAxiosResolve({ id: 'e3515ffb-d264-4dfc-8506-6c239f6673b5' })
      )
      mocks.$clientService.graphAuthenticated.users.getUser.mockResolvedValue(
        mockAxiosResolve({ id: 'e3515ffb-d264-4dfc-8506-6c239f6673b5' })
      )

      await wrapper.vm.onConfirm()
      expect(mocks.$clientService.graphAuthenticated.users.editUser).toHaveBeenCalledTimes(1)
    })
    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)

      const users = [mock<User>(), mock<User>()]
      const { wrapper, mocks, storeOptions } = getWrapper(users)
      mocks.$clientService.graphAuthenticated.users.editUser.mockRejectedValue(new Error(''))
      mocks.$clientService.graphAuthenticated.users.getUser.mockRejectedValue(new Error(''))

      await wrapper.vm.onConfirm()
      expect(storeOptions.actions.showErrorMessage).toHaveBeenCalled()
    })
  })
  describe('method "onCancel"', () => {
    it('hides the modal', async () => {
      const { wrapper, storeOptions } = getWrapper()
      await wrapper.vm.onCancel()
      expect(storeOptions.actions.hideModal).toHaveBeenCalled()
    })
  })
})

function getWrapper(users = [mock<User>()]) {
  const mocks = defaultComponentMocks()
  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.user.mockReturnValue({ uuid: '1' })
  const store = createStore(storeOptions)

  return {
    mocks,
    storeOptions,
    wrapper: shallowMount(LoginModal, {
      props: {
        users
      },
      global: {
        provide: mocks,
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
