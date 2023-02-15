import index from '../../src/index'

describe('admin settings index', () => {
  describe('navItems', () => {
    describe('general', () => {
      it.each([true, false])('should be enabled according to the permissions', (enabled) => {
        const permissionManager = { hasSystemManagement: () => enabled }
        expect(
          index
            .navItems(permissionManager)
            .find((n) => n.name === 'General')
            .enabled()
        ).toBe(enabled)
      })
    })
    describe('user management', () => {
      it.each([true, false])('should be enabled according to the permissions', (enabled) => {
        const permissionManager = { hasUserManagement: () => enabled }
        expect(
          index
            .navItems(permissionManager)
            .find((n) => n.name === 'Users')
            .enabled()
        ).toBe(enabled)
      })
    })
    describe('group management', () => {
      it.each([true, false])('should be enabled according to the permissions', (enabled) => {
        const permissionManager = { hasUserManagement: () => enabled }
        expect(
          index
            .navItems(permissionManager)
            .find((n) => n.name === 'Groups')
            .enabled()
        ).toBe(enabled)
      })
    })
    describe('space management', () => {
      it.each([true, false])('should be enabled according to the permissions', (enabled) => {
        const permissionManager = { hasSpaceManagement: () => enabled }
        expect(
          index
            .navItems(permissionManager)
            .find((n) => n.name === 'Spaces')
            .enabled()
        ).toBe(enabled)
      })
    })
  })
  describe('routes', () => {
    describe('default-route "/"', () => {
      it('should redirect to general if permission given', () => {
        const permissionManager = { hasSystemManagement: () => true }
        expect(
          index
            .routes(permissionManager)
            .find((n) => n.path === '/')
            .redirect().name
        ).toEqual('admin-settings-general')
      })
      it('should redirect to space management if no system management permission given', () => {
        const permissionManager = { hasSystemManagement: () => false }
        expect(
          index
            .routes(permissionManager)
            .find((n) => n.path === '/')
            .redirect().name
        ).toEqual('admin-settings-spaces')
      })
    })
  })
})
