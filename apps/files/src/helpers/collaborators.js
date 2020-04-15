import roles from './collaboratorRolesDefinition'

/**
 * Bitmask of ownCloud permission
 */
export const permissionsBitmask = {
  read: 1,
  update: 2,
  create: 4,
  delete: 8,
  share: 16,
  all: 31
}

/**
 * Maps role to its bitmask
 * @param {object} role  Role which is to be mapped to permissions
 * @param {array} additionalPermissions  Array of selected additional permissions
 * @returns {integer}  Role bitmask
 */
export function roleToBitmask(role, additionalPermissions = []) {
  let bitmask = 0

  for (const permission of role.permissions) {
    bitmask |= permissionsBitmask[permission]
  }

  if (additionalPermissions) {
    for (const additionalPermission of additionalPermissions) {
      if (role.additionalPermissions[additionalPermission]) {
        bitmask |= permissionsBitmask[additionalPermission]
      }
    }
  }

  return bitmask
}

/**
 * Maps bitmask to role
 * @param {number} bitmask Permissions which are to be mapped to role
 * @param {boolean} isFolder Defines if the item is folder
 * @returns {object} Role mapped to the bitmask
 */
export function bitmaskToRole(bitmask, isFolder) {
  // TODO: inject the result of "roles()" in the function header and have the caller of bitmaskToRole call roles() with appropriate arguments including translation
  // Not passing in translation as we don't need it
  const currentRoles = roles({ isFolder: isFolder })
  bitmask = parseInt(bitmask, 10)

  for (const role in currentRoles) {
    const currentRole = currentRoles[role]
    let rolePermissionsBitmask = 0

    // Get bitmask of basic permissions
    currentRole.permissions.forEach(permission => {
      rolePermissionsBitmask |= permissionsBitmask[permission]
    })

    // Copy basic permissions bitmask so that in case that no additional permissions have been set, the role is still mapped
    const roleBasicPermissionsBitmask = rolePermissionsBitmask

    // Get bitmask of additional permissions
    const additionalPermissions = currentRole.additionalPermissions
    for (const additionalPermission in additionalPermissions) {
      rolePermissionsBitmask |= permissionsBitmask[additionalPermissions[additionalPermission].name]
    }

    // TODO: Use bitmask to cover cases of more then one additional permission
    if (rolePermissionsBitmask === bitmask || roleBasicPermissionsBitmask === bitmask) {
      return currentRole
    }
  }

  return {
    name: 'advancedRole'
  }
}
