import DetailsPanel from '../../../../../src/components/Users/SideBar/DetailsPanel.vue'
import { defaultPlugins, shallowMount } from 'web-test-helpers'

describe('DetailsPanel', () => {
  describe('computed method "user"', () => {
    it('should be set if only one user is given', () => {
      const user = { displayName: 'user' }
      const { wrapper } = getWrapper({ props: { user, users: [user] } })
      expect(wrapper.vm.user).toEqual({ displayName: 'user' })
    })
    it('should not be set if no users are given', () => {
      const { wrapper } = getWrapper({
        props: { user: null, users: [] }
      })
      expect(wrapper.vm.user).toEqual(null)
    })
    it('should not be set if multiple users are given', () => {
      const { wrapper } = getWrapper({
        props: { user: null, users: [{ displayName: 'user1' }, { displayName: 'user2' }] }
      })
      expect(wrapper.vm.user).toEqual(null)
    })
  })

  describe('computed method "noUsers"', () => {
    it('should be true if no users are given', () => {
      const { wrapper } = getWrapper({
        props: { user: null, users: [] }
      })
      expect(wrapper.vm.noUsers).toBeTruthy()
    })
    it('should be false if users are given', () => {
      const user = { displayName: 'user' }
      const { wrapper } = getWrapper({ props: { user, users: [user] } })
      expect(wrapper.vm.noUsers).toBeFalsy()
    })
  })

  describe('computed method "multipleUsers"', () => {
    it('should be false if no users are given', () => {
      const { wrapper } = getWrapper({ props: { user: null, users: [] } })
      expect(wrapper.vm.multipleUsers).toBeFalsy()
    })
    it('should be false if one user is given', () => {
      const user = { displayName: 'user' }
      const { wrapper } = getWrapper({ props: { user, users: [user] } })
      expect(wrapper.vm.multipleUsers).toBeFalsy()
    })
    it('should be true if multiple users are given', () => {
      const { wrapper } = getWrapper({
        props: { user: null, users: [{ displayName: 'user1' }, { displayName: 'user2' }] }
      })
      expect(wrapper.vm.multipleUsers).toBeTruthy()
    })
  })
})

function getWrapper({ props = {} } = {}) {
  return {
    wrapper: shallowMount(DetailsPanel, {
      props: { ...props },
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}
