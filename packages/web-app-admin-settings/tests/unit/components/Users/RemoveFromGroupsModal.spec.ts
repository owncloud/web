import RemoveFromGroupsModal from '../../../../src/components/Users/RemoveFromGroupsModal.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  mockAxiosResolve,
  shallowMount
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { Group, User } from '@ownclouders/web-client/src/generated'
import { eventBus } from '@ownclouders/web-pkg'

describe('RemoveFromGroupsModal', () => {
  it('renders the input', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.find('group-select-stub').exists()).toBeTruthy()
  })

  describe('method "onConfirm"', () => {
    it('removes all users from the given groups', async () => {
      const users = [
        mock<User>({ memberOf: [{ id: '1' }] }),
        mock<User>({ memberOf: [{ id: '1' }] })
      ]
      const groups = [mock<Group>({ id: '1' })]
      const { wrapper, mocks, storeOptions } = getWrapper({ users, groups })
      mocks.$clientService.graphAuthenticated.groups.deleteMember.mockResolvedValue(undefined)
      mocks.$clientService.graphAuthenticated.users.getUser.mockResolvedValue(
        mockAxiosResolve({ id: 'e3515ffb-d264-4dfc-8506-6c239f6673b5' })
      )

      wrapper.vm.selectedOptions = groups
      const eventSpy = jest.spyOn(eventBus, 'publish')

      await wrapper.vm.onConfirm()
      expect(storeOptions.actions.showMessage).toHaveBeenCalled()
      expect(eventSpy).toHaveBeenCalled()
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)

      const users = [
        mock<User>({ memberOf: [{ id: '1' }] }),
        mock<User>({ memberOf: [{ id: '1' }] })
      ]
      const groups = [mock<Group>({ id: '1' })]
      const { wrapper, mocks, storeOptions } = getWrapper({ users, groups })
      mocks.$clientService.graphAuthenticated.groups.deleteMember.mockRejectedValue(new Error(''))
      mocks.$clientService.graphAuthenticated.users.getUser.mockRejectedValue(new Error(''))

      wrapper.vm.selectedOptions = groups
      const eventSpy = jest.spyOn(eventBus, 'publish')

      await wrapper.vm.onConfirm()
      expect(storeOptions.actions.showErrorMessage).toHaveBeenCalled()
      expect(eventSpy).not.toHaveBeenCalled()
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

function getWrapper({ users = [mock<User>()], groups = [mock<Group>()] } = {}) {
  const mocks = defaultComponentMocks()
  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.user.mockReturnValue({ uuid: '1' })
  const store = createStore(storeOptions)

  return {
    mocks,
    storeOptions,
    wrapper: shallowMount(RemoveFromGroupsModal, {
      props: {
        users,
        groups
      },
      global: {
        provide: mocks,
        plugins: [...defaultPlugins(), store],
        stubs: { GroupSelect: true }
      }
    })
  }
}
