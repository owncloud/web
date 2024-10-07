import EditPanel from '../../../../../src/components/Groups/SideBar/EditPanel.vue'
import {
  defaultComponentMocks,
  defaultPlugins,
  mockAxiosReject,
  mount
} from '@ownclouders/web-test-helpers'
import { mock } from 'vitest-mock-extended'
import { eventBus, useMessages } from '@ownclouders/web-pkg'
import { Group } from '@ownclouders/web-client/graph/generated'

describe('EditPanel', () => {
  it('renders all available inputs', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  describe('method "revertChanges"', () => {
    it('should revert changes on property editGroup', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.editGroup.displayName = 'users'
      wrapper.vm.revertChanges()
      expect(wrapper.vm.editGroup.displayName).toEqual('group')
    })
    it('should revert changes on property formData', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.formData.displayName.valid = false
      wrapper.vm.formData.displayName.errorMessage = 'error'
      wrapper.vm.revertChanges()
      expect(wrapper.vm.formData.displayName.valid).toBeTruthy()
      expect(wrapper.vm.formData.displayName.errorMessage).toEqual('')
    })
  })

  describe('method "validateDisplayName"', () => {
    it('should return true if displayName is valid', async () => {
      const { wrapper, mocks } = getWrapper()
      wrapper.vm.editGroup.displayName = 'users'
      const graphMock = mocks.$clientService.graphAuthenticated
      const getGroupStub = graphMock.groups.getGroup.mockRejectedValue(() => mockAxiosReject())
      expect(await wrapper.vm.validateDisplayName()).toBeTruthy()
      expect(getGroupStub).toHaveBeenCalled()
    })
    it('should return false if displayName is longer than 255 characters', async () => {
      const { wrapper } = getWrapper()
      wrapper.vm.editGroup.displayName = 'n'.repeat(256)
      expect(await wrapper.vm.validateDisplayName()).toBeFalsy()
    })
    it('should return false if displayName is empty', async () => {
      const { wrapper } = getWrapper()
      wrapper.vm.editGroup.displayName = ''
      expect(await wrapper.vm.validateDisplayName()).toBeFalsy()
    })
    it('should return false if displayName is already existing', async () => {
      const { wrapper, mocks } = getWrapper()
      wrapper.vm.editGroup.displayName = 'users'
      const graphMock = mocks.$clientService.graphAuthenticated
      const getGroupStub = graphMock.groups.getGroup.mockResolvedValue(
        mock<Group>({ displayName: 'group' })
      )
      expect(await wrapper.vm.validateDisplayName()).toBeFalsy()
      expect(getGroupStub).toHaveBeenCalled()
    })
  })

  describe('method "onEditGroup"', () => {
    it('should emit event on success', async () => {
      const { wrapper, mocks } = getWrapper()

      const clientService = mocks.$clientService
      clientService.graphAuthenticated.groups.editGroup.mockResolvedValue()
      clientService.graphAuthenticated.groups.getGroup.mockResolvedValue(
        mock<Group>({ id: '1', displayName: 'administrators' })
      )

      const editGroup = {
        id: '1',
        name: 'administrators'
      }

      const busStub = vi.spyOn(eventBus, 'publish')
      const updatedGroup = await wrapper.vm.onEditGroup(editGroup)

      expect(updatedGroup.id).toEqual('1')
      expect(updatedGroup.displayName).toEqual('administrators')
      expect(busStub).toHaveBeenCalled()
    })

    it('should show message on error', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper, mocks } = getWrapper()
      const clientService = mocks.$clientService
      clientService.graphAuthenticated.groups.editGroup.mockRejectedValue(undefined)
      await wrapper.vm.onEditGroup({})

      const { showErrorMessage } = useMessages()
      expect(showErrorMessage).toHaveBeenCalled()
    })
  })

  describe('computed method "invalidFormData"', () => {
    it('should be false if formData is invalid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.formData.displayName.valid = true
      expect(wrapper.vm.invalidFormData).toBeFalsy()
    })
    it('should be true if formData is valid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.formData.displayName.valid = false
      expect(wrapper.vm.invalidFormData).toBeTruthy()
    })
  })
})

function getWrapper() {
  const mocks = defaultComponentMocks()

  return {
    mocks,
    wrapper: mount(EditPanel, {
      props: {
        group: { displayName: 'group', members: [] }
      },
      global: {
        mocks,
        provide: mocks,
        plugins: [...defaultPlugins()],
        stubs: {
          'oc-text-input': true,
          'avatar-image': true,
          'oc-button': true,
          translate: true
        }
      }
    })
  }
}
