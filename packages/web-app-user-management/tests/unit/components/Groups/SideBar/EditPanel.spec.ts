import EditPanel from '../../../../../src/components/Groups/SideBar/EditPanel.vue'
import { mount } from 'web-test-helpers'

describe('EditPanel', () => {
  describe('method "revertChanges"', () => {
    it('should revert changes on property editGroup', () => {
      const { wrapper } = getWrapper({
        propsData: {
          groups: [{ displayName: 'group' }]
        }
      })
      wrapper.vm.editGroup = { displayName: 'my group' }
      wrapper.vm.revertChanges()
      expect(wrapper.vm.editGroup).toEqual({ displayName: 'group' })
    })
    it('should revert changes on property formData', () => {
      const { wrapper } = getWrapper({
        propsData: {
          groups: [{ displayName: 'group' }]
        }
      })
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
      wrapper.vm.editGroup.displayName = 'jan'
      expect(wrapper.vm.validateDisplayName()).toBeTruthy()
      expect(wrapper.vm.formData.displayName.valid).toBeTruthy()
    })
    it('should return false if displayName is not valid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.editGroup.displayName = ''
      expect(wrapper.vm.validateDisplayName()).toBeFalsy()
      expect(wrapper.vm.formData.displayName.valid).toBeFalsy()
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

function getWrapper({ propsData = {} } = {}) {
  return {
    wrapper: mount(EditPanel, {
      props: {
        groups: [{ displayName: 'group' }],
        ...propsData
      },
      global: {
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
