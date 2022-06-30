import index from '../../src/index'

describe('navItems', () => {
  describe('function "enabled"', () => {
    it('should be true if permissions are sufficient', () => {
      window.Vue = {}
      window.Vue.$permissionManager = {
        hasUserManagement: () => true
      }
      expect(index.navItems[0].enabled()).toBeTruthy()
      expect(index.navItems[1].enabled()).toBeTruthy()
    })
    it('should be false if permissions are insufficient', () => {
      window.Vue = {}
      window.Vue.$permissionManager = {
        hasUserManagement: () => false
      }
      expect(index.navItems[0].enabled()).toBeFalsy()
      expect(index.navItems[1].enabled()).toBeFalsy()
    })
  })
})
