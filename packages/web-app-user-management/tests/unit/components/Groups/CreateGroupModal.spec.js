import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import CreateGroupModal from '../../../../src/components/Groups/CreateGroupModal.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

afterEach(() => jest.clearAllMocks())

describe('CreateGroupModal', () => {
  describe('computed method "buttonConfirmDisabled"', () => {
    it('should be true if any data set is invalid', () => {
      const wrapper = getWrapper()
      wrapper.vm.formData.displayName.valid = false
      expect(wrapper.vm.buttonConfirmDisabled).toBeTruthy()
    })
  })
  it('should be false if no data set is invalid', () => {
    const wrapper = getWrapper()
    Object.keys(wrapper.vm.formData).forEach((key) => {
      wrapper.vm.formData[key].valid = true
    })
    expect(wrapper.vm.buttonConfirmDisabled).toBeFalsy()
  })

  describe('method "validateDisplayName"', () => {
    it('should be false when displayName is empty', () => {
      const wrapper = getWrapper()
      wrapper.vm.group.displayName = ''
      expect(wrapper.vm.validateDisplayName()).toBeFalsy()
    })
    it('should be false when displayName is already existing', () => {
      const wrapper = getWrapper()
      wrapper.vm.group.displayName = 'admins'
      expect(wrapper.vm.validateDisplayName()).toBeFalsy()
    })
    it('should be true when displayName is valid', () => {
      const wrapper = getWrapper()
      wrapper.vm.group.displayName = 'users'
      expect(wrapper.vm.validateDisplayName()).toBeTruthy()
    })
  })
})

function getWrapper() {
  return mount(CreateGroupModal, {
    localVue,
    mocks: {
      $gettext: jest.fn(),
      $gettextInterpolate: jest.fn()
    },
    propsData: {
      cancel: jest.fn(),
      confirm: jest.fn(),
      existingGroups: [
        {
          displayName: 'admins'
        }
      ]
    },
    stubs: { 'oc-modal': true, 'oc-text-input': true }
  })
}
