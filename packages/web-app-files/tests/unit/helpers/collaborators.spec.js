import {
  permissionsBitmask,
  roleToBitmask,
  bitmaskToRole,
  checkPermission
} from '../../../src/helpers/collaborators.js'

describe('collaborators', () => {
  it('permission bitmask', () => {
    expect(permissionsBitmask).toMatchObject({
      read: 1,
      update: 2,
      create: 4,
      delete: 8,
      share: 16,
      all: 31
    })
  })

  describe('role to bitmask', () => {
    it.each([
      {
        role: {
          additionalPermissions: {
            share: true,
            update: true
          },
          permissions: ['read']
        },
        additionalPermissions: ['share', 'update'],
        expectedBitmask: 19
      },
      {
        role: {
          additionalPermissions: {
            share: false,
            update: true
          },
          permissions: ['read']
        },
        additionalPermissions: ['share', 'update'],
        expectedBitmask: 3
      },
      {
        role: {
          additionalPermissions: {
            share: false,
            update: false
          },
          permissions: ['read']
        },
        additionalPermissions: ['share', 'update'],
        expectedBitmask: 1
      },
      {
        role: {
          additionalPermissions: {
            share: true,
            update: false
          },
          permissions: []
        },
        additionalPermissions: ['share', 'update'],
        expectedBitmask: 16
      },
      {
        role: {
          additionalPermissions: {
            share: false,
            update: false
          },
          permissions: ['all']
        },
        additionalPermissions: ['share', 'update'],
        expectedBitmask: 31
      },
      {
        role: {
          additionalPermissions: {
            share: true,
            update: true
          },
          permissions: ['all', 'share']
        },
        additionalPermissions: ['share', 'update'],
        expectedBitmask: 31
      },
      {
        role: {
          additionalPermissions: {
            share: true,
            update: true
          },
          permissions: ['all', 'share']
        },
        additionalPermissions: false,
        expectedBitmask: 31
      },
      {
        role: {
          additionalPermissions: { share: true },
          permissions: ['read', 'update']
        },
        additionalPermissions: false,
        expectedBitmask: 3
      },
      {
        role: {
          additionalPermissions: { copy: true },
          permissions: ['copy', 'move']
        },
        additionalPermissions: ['copy'],
        expectedBitmask: 0
      }
    ])(
      'should return the sum of role permissions and additional permissions bitmasks if the given role has provided additional permission',
      input => {
        expect(roleToBitmask(input.role, input.additionalPermissions)).toBe(input.expectedBitmask)
      }
    )
  })

  describe('bitmask to role', () => {
    it.each([
      {
        bitmask: 7,
        isFolder: false,
        allowSharePerm: false
      },
      {
        bitmask: 7,
        isFolder: true,
        allowSharePerm: false
      },
      {
        bitmask: 7,
        isFolder: false,
        allowSharePerm: true
      },
      {
        bitmask: 7,
        isFolder: false,
        allowSharePerm: false
      },
      {
        bitmask: 31,
        isFolder: false,
        allowSharePerm: false
      },
      {
        bitmask: 31,
        isFolder: false,
        allowSharePerm: true
      }
    ])(
      'should return advanced role if the given bitmask does not match role permissions bitmask or basic permissions bitmask',
      input => {
        // assume a case when share permission is not allowed, the resource is not folder and provided bitmask is 17
        // two roles with following permissions are available from roleDefinition helper
        // - viewer with permissions ['read']
        // - editor with permissions ['read', 'update']
        // with any of the role, the sum of permission bitmask (1 || 3) does not matches provided bitmask (17)
        // so the function will return {advancedRole}
        expect(bitmaskToRole(input.bitmask, input.isFolder, input.allowSharePerm)).toMatchObject({
          name: 'advancedRole'
        })
      }
    )
    it.each([
      {
        bitmask: 17,
        isFolder: false,
        allowSharePerm: true,
        expectedRole: 'viewer',
        expectedPermissions: ['read', 'share']
      },
      {
        bitmask: 17,
        isFolder: false,
        allowSharePerm: true,
        expectedRole: 'viewer',
        expectedPermissions: ['read', 'share']
      },
      {
        bitmask: 3,
        isFolder: false,
        allowSharePerm: false,
        expectedRole: 'editor',
        expectedPermissions: ['read', 'update']
      },
      {
        bitmask: 15,
        isFolder: true,
        allowSharePerm: false,
        expectedRole: 'editor',
        expectedPermissions: ['read', 'update', 'create', 'delete']
      },
      {
        bitmask: 31,
        isFolder: true,
        allowSharePerm: true,
        expectedRole: 'editor',
        expectedPermissions: ['read', 'update', 'create', 'delete', 'share']
      }
    ])(
      'should return the first matching role if the given bitmask equals the role permissions bitmask',
      input => {
        // assume a case when share permission is allowed and resource is not folder and provided bitmask is 17
        // two roles with following permissions are available from the roleDefinition helper
        // - viewer with permissions ['read', 'share']
        // - editor with permissions ['read', 'update', 'share']
        // with the first role, the sum of permission bitmask (1 + 16) matches provided bitmask (17)
        // so the function has found a match and returns the role {viewer}
        expect(bitmaskToRole(input.bitmask, input.isFolder, input.allowSharePerm)).toMatchObject({
          name: input.expectedRole,
          permissions: input.expectedPermissions
        })
      }
    )
    it.each(['17', 17.2, '17.8'])('should parse provided bitmask to integer', bitmask => {
      expect(bitmaskToRole(bitmask, false, true)).toMatchObject({
        name: 'viewer'
      })
    })
    it.each([0, 100, -5])('should return advanced role for invalid bitmask values', bitmask => {
      expect(bitmaskToRole(bitmask, false, true)).toMatchObject({
        name: 'advancedRole'
      })
    })
    it.each([true, {}, [17]])(
      'should throw error if bitmask is not a number or a stringified number',
      bitmask => {
        expect(() => {
          bitmaskToRole(bitmask, false, true)
        }).toThrowError(
          'TypeError: bitmask is expected to be a number or stringified number but was found: ' +
            typeof bitmask
        )
      }
    )
  })

  describe('check permission', () => {
    it.each([
      permissionsBitmask.read + permissionsBitmask.update,
      (permissionsBitmask.read + permissionsBitmask.update).toString(),
      permissionsBitmask.update,
      permissionsBitmask.update.toString()
    ])('should return true if given bitmask is found in permissions bitmask', bitmask => {
      expect(checkPermission(bitmask, 'update')).toBeTruthy()
    })
    it('should return false if given bitmask does not equal permissionBitmask', () => {
      expect(checkPermission(permissionsBitmask.read, 'update')).toBeFalsy()
    })
    it('should return false if given permission is not found in permissions bitmask', () => {
      expect(checkPermission(1, 'modify')).toBeFalsy()
    })
    it.each([
      { bitmask: true, permission: 'read' },
      { bitmask: false, permission: 'read' },
      { bitmask: false, permission: true },
      { bitmask: 17, permission: true },
      { bitmask: {}, permission: 'read' },
      { bitmask: [7], permission: 'read' }
    ])('should return false if given input is not valid', input => {
      expect(checkPermission(input.bitmask, input.permission)).toBeFalsy()
    })
  })
})
