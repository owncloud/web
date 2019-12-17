const { client } = require('nightwatch-api')
const httpHelper = require('./httpHelper')
const { normalize, join } = require('./path')
const userSettings = require('./userSettings')
const fetch = require('node-fetch')
const assert = require('assert')

module.exports = {
  SHARE_TYPES: Object.freeze({
    user: 0,
    group: 1,
    public_link: 3,
    federated_cloud_share: 6
  }),
  PERMISSION_TYPES: Object.freeze({
    read: 1,
    update: 2,
    create: 4,
    delete: 8,
    share: 16,
    all: 31
  }),
  SHARE_STATE: Object.freeze({
    accepted: 0,
    pending: 1,
    declined: 2
  }),
  COLLABORATOR_PERMISSION_ARRAY: ['share', 'update', 'create', 'delete'],
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
  },
  /**
   * converts the human readable share-type string to the API number as defined in https://doc.owncloud.com/server/10.0/developer_manual/core/ocs-share-api.html#create-a-new-share
   * @param {string} shareTypeString
   * @returns {number}
   */
  humanReadableShareTypeToNumber: function (shareTypeString) {
    shareTypeString = shareTypeString.trim()
    if (!(shareTypeString in this.SHARE_TYPES)) {
      throw Error('Invalid share type: ' + shareTypeString)
    }
    return this.SHARE_TYPES[shareTypeString]
  },
  /**
   * if the given string starts with a `+` or `-` the function will calculate the date (from today) and return the string of the new date
   * @param {string} dateString
   * @returns {string}
   */
  calculateDate: function (dateString) {
    if (dateString.startsWith('+') || dateString.startsWith('-')) {
      dateString = parseInt(dateString)
      const date = new Date()
      date.setDate(date.getDate() + dateString)
      dateString = date.getFullYear() + '-' +
                   String((date.getMonth() + 1)).padStart(2, '0') + '-' +
                   String(date.getDate()).padStart(2, '0') +
                   ' 00:00:00'
    }
    return dateString
  },
  /**
   *
   * @param {string } user
   * @param {string } expectedDetailsTable
   * @param {Object} filters - extra argument to filter list of shares
   *
   * @returns {Promise<unknown>}
   */
  assertUserHasShareWithDetails: function (user, expectedDetailsTable, filters = {}) {
    const headers = httpHelper.createAuthHeader(user)
    const sharingHelper = this
    const apiURL = new URL(join(client.globals.backend_url, '/ocs/v2.php/apps/files_sharing/api/v1/shares'))
    apiURL.search = new URLSearchParams({ format: 'json', ...filters }).toString()

    return fetch(apiURL, { method: 'GET', headers: headers })
      .then(res => res.json())
      .then(function (sharesResult) {
        httpHelper.checkOCSStatus(sharesResult, 'Could not get shares. Message: ' + sharesResult.ocs.meta.message)
        const shares = sharesResult.ocs.data
        let found
        for (const share of shares) {
          found = true
          for (const expectedDetail of expectedDetailsTable.hashes()) {
            expectedDetail.value = userSettings.replaceInlineCode(expectedDetail.value)
            if (expectedDetail.field === 'permissions') {
              expectedDetail.value = sharingHelper.humanReadablePermissionsToBitmask(expectedDetail.value).toString()
            } else if (expectedDetail.field === 'share_type') {
              expectedDetail.value = sharingHelper.humanReadableShareTypeToNumber(expectedDetail.value).toString()
            } else if (expectedDetail.field === 'expiration') {
              expectedDetail.value = sharingHelper.calculateDate(expectedDetail.value)
            }

            if (!(expectedDetail.field in share) || share[expectedDetail.field].toString() !== expectedDetail.value) {
              found = false
              break
            }
          }
          if (found) {
            break
          }
        }
        assert.strictEqual(
          found, true, 'could not find expected share in "' + JSON.stringify(sharesResult, null, 2) + '"'
        )
        return this
      })
  },
  /**
   * Asynchronously fetches the last public link created by the given link creator
   *
   * @async
   * @param {string} linkCreator link creator
   * @return {Promise<Object>} last share token
   */
  fetchLastPublicLinkShare: async function (linkCreator) {
    const self = this
    const headers = httpHelper.createAuthHeader(linkCreator)
    const apiURL = client.globals.backend_url + '/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json'
    let lastShareToken
    let lastShare
    await fetch(apiURL, { method: 'GET', headers: headers })
      .then(res => res.json())
      .then(function (sharesResult) {
        httpHelper.checkOCSStatus(sharesResult, 'Could not get shares. Message: ' + sharesResult.ocs.meta.message)
        const shares = sharesResult.ocs.data
        let lastFoundShareId = 0
        for (const share of shares) {
          if (share.share_type === self.SHARE_TYPES.public_link && share.id >= lastFoundShareId) {
            lastFoundShareId = share.id
            lastShareToken = share.token
            lastShare = share
          }
        }
        if (lastShareToken === null) {
          throw Error('Could not find public shares. All shares: ' + JSON.stringify(shares, null, 2))
        }
      })
    return lastShare
  },
  /**
   * get a list of all public link shares shared by provided sharer
   *
   * @param sharer user whose all public links are to be fetched
   * @returns {Object<[]>}
   */
  getAllPublicLinkShares: async function (sharer) {
    const headers = httpHelper.createAuthHeader(sharer)
    const data = []
    const apiURL = client.globals.backend_url + '/ocs/v2.php/apps/files_sharing/api/v1/shares?&format=json'
    const response = await fetch(apiURL, { method: 'GET', headers: headers })
    const jsonResponse = await response.json()
    httpHelper.checkOCSStatus(jsonResponse, 'Could not get shares. Message: ' + jsonResponse.ocs.meta.message)
    for (const share of jsonResponse.ocs.data) {
      if (share.share_type === this.SHARE_TYPES.public_link) {
        data.push(share)
      }
    }
    return data
  },
  /**
   *
   * @param {string} user
   * @param {boolean} sharedWithUser
   * @returns {Promise<[*]>}
   */
  getAllShares: function (user, sharedWithUser = false) {
    const headers = httpHelper.createAuthHeader(user)
    let sharedWithMeText = ''
    if (sharedWithUser === true) {
      sharedWithMeText = '&shared_with_me=true'
    }
    const apiURL = client.globals.backend_url +
                   '/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json&state=all' +
                   sharedWithMeText
    return fetch(apiURL,
      {
        method: 'GET',
        headers: headers
      })
      .then(res => {
        httpHelper.checkStatus(res, 'The response status is not the expected value')
        return res.json()
      })
      .then(res => {
        return res.ocs.data
      })
  },
  getAllSharesSharedWithUser: function (user) {
    return this.getAllShares(user, true)
  },
  getAllSharesSharedByUser: function (user) {
    return this.getAllShares(user)
  },

  /**
   * Asynchronously declines the shares in pending state and meeting the conditions
   *
   * @async
   * @param {string} filename
   * @param {string} user
   * @param {string} sharer
   */
  declineShare: async function (filename, user, sharer) {
    const allShares = await this.getAllSharesSharedWithUser(user)
    const elementsToDecline = allShares.filter((element) => {
      return element.state === this.SHARE_STATE.pending &&
        normalize(element.path) === filename &&
        element.uid_owner === sharer
    })
    if (elementsToDecline.length < 1) {
      throw new Error('Could not find the share to be declined')
    }
    for (const element of elementsToDecline) {
      const shareID = element.id
      const headers = httpHelper.createAuthHeader(user)
      const apiURL = client.globals.backend_url +
                    '/ocs/v2.php/apps/files_sharing/api/v1/shares/pending/' + shareID + '?format=json'
      return fetch(apiURL,
        {
          method: 'DELETE',
          headers: headers
        })
        .then(res => {
          res = httpHelper.checkStatus(res, 'The response status is not the expected value')
          return res.json()
        }).then(res => {
          httpHelper.checkOCSStatus(res, 'Could not perform the decline action')
        })
    }
  },

  /**
   * Asynchronously accepts the shares in pending state and meeting the conditions
   *
   * @async
   * @param {string} filename
   * @param {string} user
   * @param {string} sharer
   */
  acceptShare: async function (filename, user, sharer) {
    const allShares = await this.getAllSharesSharedWithUser(user)
    const elementsToAccept = allShares.filter((element) => {
      return element.state === this.SHARE_STATE.pending &&
        element.path.slice(1) === filename &&
        element.uid_owner === sharer
    })
    if (elementsToAccept.length < 1) {
      throw new Error('Could not find the share to be accepted')
    }
    for (const element of elementsToAccept) {
      const shareID = element.id
      const headers = httpHelper.createAuthHeader(user)
      const apiURL = client.globals.backend_url +
                      '/ocs/v2.php/apps/files_sharing/api/v1/shares/pending/' + shareID + '?format=json'
      return fetch(apiURL,
        {
          method: 'POST',
          headers: headers
        })
        .then(res => {
          res = httpHelper.checkStatus(res, 'The response status is not the expected value')
          return res.json()
        }).then(res => {
          httpHelper.checkOCSStatus(res, 'Could not perform the accept action')
        })
    }
  },
  /**
   * asserts expectedDetails with the last public link share of a user
   *
   * @param {string} linkCreator - owner of public link share
   * @param {Object} expectedDetails - provided expected details of last public link share for assertion
   * @param {string} expectedDetails.token - token of the public link share
   * @param {string} expectedDetails.expireDate - expire date for public link share in format 'YYYY-MM-DD'
   * @returns {Promise<void>}
   */
  assertUserLastPublicShareDetails: async function (linkCreator, expectedDetails) {
    const lastShare = await this.fetchLastPublicLinkShare(linkCreator)
    if (lastShare.share_type === this.SHARE_TYPES.public_link) {
      const regDate = lastShare.expiration.split(' ')[0]
      if (expectedDetails.token) {
        assert.strictEqual(
          lastShare.token, expectedDetails.token, 'Token Missmatch' + lastShare
        )
      }
      if (expectedDetails.expireDate) {
        assert.strictEqual(
          regDate, expectedDetails.expireDate, 'Expiry Date Missmatch: ' + lastShare
        )
      }
    } else {
      throw new Error('Invalid Share Type' + lastShare)
    }
  }
}
