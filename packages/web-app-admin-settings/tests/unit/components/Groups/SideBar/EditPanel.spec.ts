import EditPanel from '../../../../../src/components/Groups/SideBar/EditPanel.vue'
import { defaultComponentMocks, defaultPlugins, mockAxiosReject, mount } from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { AxiosResponse } from 'axios'

describe('EditPanel', () => {
  it('renders all available inputs', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  describe('method "revertChanges"', () => {
    it('should revert changes on property editGroup', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.editGroup.dispayName = 'users'
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
        mock<AxiosResponse>({ data: { displayName: 'group' } })
      )
      expect(await wrapper.vm.validateDisplayName()).toBeFalsy()
      expect(getGroupStub).toHaveBeenCalled()
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
