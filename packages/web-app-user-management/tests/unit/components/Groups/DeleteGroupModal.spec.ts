import DeleteGroupModal from '../../../../src/components/Groups/DeleteGroupModal.vue'
import { defaultPlugins, shallowMount } from 'web-test-helpers'

describe('DeleteGroupModal', () => {
  describe('computed method "title"', () => {
    it('should be singular if one group is given', () => {
      const { wrapper } = getWrapper({
        propsData: {
          groups: [{ id: '1', displayName: 'Scientists' }]
        }
      })
      expect(wrapper.vm.title).toEqual('Delete group Scientists?')
    })
    it('should be plural if multiple groups are given', () => {
      const { wrapper } = getWrapper({
        propsData: {
          groups: [{ id: '1' }, { id: '2' }]
        }
      })
      expect(wrapper.vm.title).toEqual('Delete 2 selected groups?')
    })
  })

  describe('computed method "message"', () => {
    it('should be singular if one group is given', () => {
      const { wrapper } = getWrapper({
        propsData: {
          groups: [{ id: '1', displayName: 'Scientists' }]
        }
      })
      expect(wrapper.vm.message).toEqual('Are you sure you want to delete this group?')
    })
    it('should be plural if multiple groups are given', () => {
      const { wrapper } = getWrapper({
        propsData: {
          groups: [{ id: '1' }, { id: '2' }]
        }
      })
      expect(wrapper.vm.message).toEqual('Are you sure you want to delete all selected groups?')
    })
  })
})

function getWrapper({ propsData = {} } = {}) {
  return {
    wrapper: shallowMount(DeleteGroupModal, {
      props: { ...propsData },
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}
