import EditPanel from '../../../../../src/components/Users/SideBar/EditPanel.vue'
import { defaultPlugins, shallowMount } from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { Group } from 'web-client/src/generated'

const availableGroupOptions = [mock<Group>({ id: '1' }), mock<Group>({ id: '2' })]
const selectors = {
  groupSelectStub: 'group-select-stub'
}

describe('EditPanel', () => {
  it('renders all available inputs', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('filters selected groups when passing the options to the GroupSelect component', () => {
    const { wrapper } = getWrapper({ selectedGroups: [availableGroupOptions[0]] })
    const selectedGroups = wrapper
      .findComponent<any>(selectors.groupSelectStub)
      .props('selectedGroups')
    const groupOptions = wrapper.findComponent<any>(selectors.groupSelectStub).props('groupOptions')
    expect(selectedGroups.length).toBe(1)
    expect(selectedGroups[0].id).toEqual(availableGroupOptions[0].id)
    expect(groupOptions.length).toBe(1)
    expect(groupOptions[0].id).toEqual(availableGroupOptions[1].id)
  })
  describe('method "revertChanges"', () => {
    it('should revert changes on property editUser', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.editUser.displayName = 'jana'
      wrapper.vm.editUser.mail = 'jana@owncloud.com'
      wrapper.vm.revertChanges()
      expect(wrapper.vm.editUser.displayName).toEqual('jan')
      expect(wrapper.vm.editUser.mail).toEqual('jan@owncloud.com')
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
    it('should return true if displayName is valid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.editUser.displayName = 'jan'
      expect(wrapper.vm.validateDisplayName()).toBeTruthy()
      expect(wrapper.vm.formData.displayName.valid).toBeTruthy()
    })
    it('should return false if displayName is not valid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.editUser.displayName = ''
      expect(wrapper.vm.validateDisplayName()).toBeFalsy()
      expect(wrapper.vm.formData.displayName.valid).toBeFalsy()
    })
  })

  describe('method "validateEmail"', () => {
    it('should return true if email is valid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.editUser.mail = 'jan@owncloud.com'
      expect(wrapper.vm.validateEmail()).toBeTruthy()
      expect(wrapper.vm.formData.email.valid).toBeTruthy()
    })
    it('should return false if email is not valid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.editUser.mail = ''
      expect(wrapper.vm.validateEmail()).toBeFalsy()
      expect(wrapper.vm.formData.email.valid).toBeFalsy()
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

function getWrapper({ selectedGroups = [] } = {}) {
  return {
    wrapper: shallowMount(EditPanel, {
      props: {
        user: {
          id: '1',
          displayName: 'jan',
          mail: 'jan@owncloud.com',
          passwordProfile: { password: '' },
          drive: { quota: {} },
          memberOf: selectedGroups
        },
        roles: [{ id: '1', displayName: 'admin' }],
        groups: availableGroupOptions
      },
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}
