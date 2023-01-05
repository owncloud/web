import DeleteUserModal from '../../../../src/components/Users/DeleteUserModal.vue'
import { defaultPlugins, shallowMount } from 'web-test-helpers'

describe('DeleteUserModal', () => {
  describe('computed method "title"', () => {
    it('should be singular if one user is given', () => {
      const { wrapper } = getWrapper({
        propsData: {
          users: [{ id: '1', onPremisesSamAccountName: 'Marie' }]
        }
      })
      expect(wrapper.vm.title).toEqual('Delete user Marie?')
    })
    it('should be plural if multiple users are given', () => {
      const { wrapper } = getWrapper({
        propsData: {
          users: [{ id: '1' }, { id: '2' }]
        }
      })
      expect(wrapper.vm.title).toEqual('Delete 2 selected users?')
    })
  })

  describe('computed method "message"', () => {
    it('should be singular if one user is given', () => {
      const { wrapper } = getWrapper({
        propsData: {
          users: [{ id: '1', onPremisesSamAccountName: 'Marie' }]
        }
      })
      expect(wrapper.vm.message).toEqual('Are you sure you want to delete this user?')
    })
    it('should be plural if multiple users are given', () => {
      const { wrapper } = getWrapper({
        propsData: {
          users: [{ id: '1' }, { id: '2' }]
        }
      })
      expect(wrapper.vm.message).toEqual('Are you sure you want to delete all selected users?')
    })
  })
})

function getWrapper({ propsData = {} } = {}) {
  return {
    wrapper: shallowMount(DeleteUserModal, {
      props: { ...propsData },
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}
