import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import DeleteUserModal from '../../../../src/components/Users/DeleteUserModal.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

afterEach(() => jest.clearAllMocks())

describe('DeleteUserModal', () => {
  describe('computed method "title"', () => {
    it('should be singular if one user is given', () => {
      const wrapper = getWrapper({
        propsData: {
          users: [{ id: '1' }]
        }
      })
      expect(wrapper.vm.title).toEqual('Delete user %{user}?')
    })
    it('should be plural if multiple users are given', () => {
      const wrapper = getWrapper({
        propsData: {
          users: [{ id: '1' }, { id: '2' }]
        }
      })
      expect(wrapper.vm.title).toEqual('Delete %{userCount} selected users?')
    })
  })

  describe('computed method "message"', () => {
    it('should be singular if one user is given', () => {
      const wrapper = getWrapper({
        propsData: {
          users: [{ id: '1' }]
        }
      })
      expect(wrapper.vm.message).toEqual('Are you sure you want to delete this user?')
    })
    it('should be plural if multiple users are given', () => {
      const wrapper = getWrapper({
        propsData: {
          users: [{ id: '1' }, { id: '2' }]
        }
      })
      expect(wrapper.vm.message).toEqual('Are you sure you want to delete all selected users?')
    })
  })
})

function getWrapper({ propsData = {} } = {}) {
  return mount(DeleteUserModal, {
    localVue,
    propsData: {
      ...propsData
    },
    stubs: { 'oc-modal': true, 'oc-text-input': true },
    mocks: {
      $gettextInterpolate: (translation) => translation,
      $ngettext: (translationSingular, translationPlural, count) =>
        count > 1 ? translationPlural : translationSingular
    }
  })
}
