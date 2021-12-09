import { SharePermissions } from '../../../../src/helpers/share'

describe('SharePermissions', () => {
  it.each([
    [
      'empty permissions',
      {
        permissions: [],
        bitmask: 0
      }
    ],
    [
      'single permission',
      {
        permissions: [SharePermissions.read],
        bitmask: SharePermissions.read.bit
      }
    ],
    [
      'duplicated permission does not duplicate bitmask',
      {
        permissions: [SharePermissions.read, SharePermissions.read],
        bitmask: SharePermissions.read.bit
      }
    ],
    [
      'multiple permissions add up in bitmask',
      {
        permissions: [SharePermissions.read, SharePermissions.create],
        bitmask: SharePermissions.read.bit + SharePermissions.create.bit
      }
    ]
  ])('permissionsToBitmask, %s', (name, { permissions, bitmask }) => {
    expect(SharePermissions.permissionsToBitmask(permissions)).toBe(bitmask)
  })

  it.each([
    [
      'bitmask 0 results in empty permission list',
      {
        bitmask: 0,
        permissions: []
      }
    ],
    [
      'bitmask 1 results in permission list with read permission',
      {
        bitmask: SharePermissions.read.bit,
        permissions: [SharePermissions.read]
      }
    ],
    [
      'bitmask 9 results in permission list with read and delete permission',
      {
        bitmask: SharePermissions.read.bit + SharePermissions.delete.bit,
        permissions: [SharePermissions.read, SharePermissions.delete]
      }
    ]
  ])('bitmaskToPermissions, %s', (name, { bitmask, permissions }) => {
    expect(
      SharePermissions.bitmaskToPermissions(bitmask)
        .map((p) => p.key)
        .sort()
    ).toEqual(permissions.map((p) => p.key).sort())
  })
})
