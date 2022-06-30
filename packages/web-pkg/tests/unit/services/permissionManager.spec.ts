import { PermissionManager } from '../../../src/services'

beforeEach(jest.resetAllMocks)

describe('permissionManager', () => {
  describe('method "hasUserManagement"', () => {
    test('should be true if user has sufficient rights', () => {
      const permissionManager = new PermissionManager({
        getters: { user: { role: { name: 'admin' } } }
      } as any)
      expect(permissionManager.hasUserManagement()).toBeTruthy()
    })
    test('should be false if user has insufficient rights', () => {
      const permissionManager = new PermissionManager({
        getters: { user: { role: { name: 'user' } } }
      } as any)
      expect(permissionManager.hasUserManagement()).toBeFalsy()
    })
  })
  describe('method "hasSpaceManagement"', () => {
    test('should be true if user has sufficient rights', () => {
      const permissionManager = new PermissionManager({
        getters: { user: { role: { name: 'admin' } } }
      } as any)
      expect(permissionManager.hasUserManagement()).toBeTruthy()
    })
    test('should be false if user has insufficient rights', () => {
      const permissionManager = new PermissionManager({
        getters: { user: { role: { name: 'user' } } }
      } as any)
      expect(permissionManager.hasUserManagement()).toBeFalsy()
    })
  })
})
