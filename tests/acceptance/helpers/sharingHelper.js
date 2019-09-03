module.exports = {
  PERMISSION_TYPES: {
    read: 1,
    change: 2,
    create: 4,
    delete: 8,
    share: 16,
    all: 31
  },
  /**
   *
   * @param permissionsString string of permissions separated by comma. For valid permissions see this.PERMISSION_TYPES
   * @returns {number} a number the OCS sharing API understands see https://doc.owncloud.com/server/developer_manual/core/apis/ocs-share-api.html
   */
  humanReadablePermissionsToBitmask: function (permissionsString) {
    let permissionBitMask = 0
    let humanReadablePermissions = permissionsString.split(',')
    humanReadablePermissions = humanReadablePermissions.map(function (s) {
      return String.prototype.trim.apply(s)
    })
    for (var i = 0; i < humanReadablePermissions.length; i++) {
      if (humanReadablePermissions[i] in this.PERMISSION_TYPES) {
        permissionBitMask = permissionBitMask + this.PERMISSION_TYPES[humanReadablePermissions[i]]
      } else {
        throw Error('Invalid permission: ' + humanReadablePermissions[i])
      }
    }
    return permissionBitMask
  }
}
