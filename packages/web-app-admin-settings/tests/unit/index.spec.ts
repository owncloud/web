import index from '../../src/index'

describe('admin settings index', () => {
  describe('navItems', () => {
    describe('general', () => {
      it.each([true, false])('should be enabled according to the permissions', (enabled) => {
        ;(window as any).__$permissionManager = {
          hasSystemManagement: () => enabled
        }
        expect(index.navItems.find((n) => n.name === 'General').enabled()).toBe(enabled)
      })
    })
    describe('user management', () => {
      it.each([true, false])('should be enabled according to the permissions', (enabled) => {
        ;(window as any).__$permissionManager = {
          hasUserManagement: () => enabled
        }
        expect(index.navItems.find((n) => n.name === 'Users').enabled()).toBe(enabled)
      })
    })
    describe('group management', () => {
      it.each([true, false])('should be enabled according to the permissions', (enabled) => {
        ;(window as any).__$permissionManager = {
          hasUserManagement: () => enabled
        }
        expect(index.navItems.find((n) => n.name === 'Groups').enabled()).toBe(enabled)
      })
    })
    describe('space management', () => {
      it.each([true, false])('should be enabled according to the permissions', (enabled) => {
        ;(window as any).__$permissionManager = {
          hasSpaceManagement: () => enabled
        }
        expect(index.navItems.find((n) => n.name === 'Spaces').enabled()).toBe(enabled)
      })
    })
  })
  describe('routes', () => {
    describe('default-route "/"', () => {
      it('should redirect to general if permission given', () => {
        ;(window as any).__$permissionManager = {
          hasSystemManagement: () => true
        }
        expect(index.routes.find((n) => n.path === '/').redirect().name).toEqual(
          'admin-settings-general'
        )
      })
      it('should redirect to space management if no system management permission given', () => {
        ;(window as any).__$permissionManager = {
          hasSystemManagement: () => false
        }
        expect(index.routes.find((n) => n.path === '/').redirect().name).toEqual(
          'admin-settings-spaces'
        )
      })
    })
  })
})
