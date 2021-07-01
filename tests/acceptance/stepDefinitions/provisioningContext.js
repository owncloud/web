const { client } = require('nightwatch-api')
const { Given, After } = require('cucumber')
const fs = require('fs-extra')
const assert = require('assert')
require('url-search-params-polyfill')
const httpHelper = require('../helpers/httpHelper')
const backendHelper = require('../helpers/backendHelper')
const userSettings = require('../helpers/userSettings')
const codify = require('../helpers/codify')
const { join } = require('../helpers/path')

const ldap = require('../helpers/ldapHelper')
const sharingHelper = require('../helpers/sharingHelper')
const { setConfigs, getActualSkeletonDir } = require('../helpers/config')

function createDefaultUser(userId, skeletonType) {
  const password = userSettings.getPasswordForUser(userId)
  const displayname = userSettings.getDisplayNameOfDefaultUser(userId)
  const email = userSettings.getEmailAddressOfDefaultUser(userId)
  if (client.globals.ldap) {
    return ldap.createUser(client.globals.ldapClient, userId)
  }
  return createUser(userId, password, displayname, email, skeletonType)
}

async function createUser(
  userId,
  password,
  displayName = false,
  email = false,
  skeletonType = 'large'
) {
  if (!client.globals.ocis) {
    await setConfigs(skeletonType)
  }
  const body = new URLSearchParams()
  if (client.globals.ocis) {
    if (!email) {
      email = userId + '@example.com'
    }
    body.append('username', userId)
    body.append('email', email)
  }
  body.append('userid', userId)
  body.append('password', password)
  body.append('displayname', displayName)
  const promiseList = []

  userSettings.addUserToCreatedUsersList(userId, password, displayName, email)
  const url = 'cloud/users'
  return httpHelper
    .postOCS(url, 'admin', body)
    .then(res => httpHelper.checkStatus(res, 'Failed while creating user'))
    .then(res => res.json())
    .then(res => httpHelper.checkOCSStatus(res, 'Failed while creating user'))
    .then(() => {
      if (client.globals.ocis) {
        const actualSkeletonDir = getActualSkeletonDir(skeletonType)
        if (actualSkeletonDir) {
          const skelDir = join(client.globals.testing_data_dir, actualSkeletonDir)
          const dataDir = join(client.globals.ocis_data_dir, userId)
          if (!fs.existsSync(dataDir)) {
            fs.removeSync(dataDir)
            fs.mkdirpSync(dataDir)
          }
          return fs.copy(skelDir, join(dataDir, 'files'))
        }
      }
      if (displayName) {
        promiseList.push(
          new Promise((resolve, reject) => {
            const body = new URLSearchParams()
            body.append('key', 'display')
            body.append('value', displayName)
            const url = `cloud/users/${encodeURIComponent(userId)}`
            httpHelper.putOCS(url, 'admin', body).then(res => {
              if (res.status !== 200) {
                reject(new Error('Could not set display name of user'))
              }
              resolve(res)
            })
          })
        )
      }
    })
    .then(() => {
      if (client.globals.ocis) {
        return
      }
      if (email) {
        promiseList.push(
          new Promise((resolve, reject) => {
            const body = new URLSearchParams()
            body.append('key', 'email')
            body.append('value', email)
            const url = `cloud/users/${encodeURIComponent(userId)}`
            httpHelper.putOCS(url, 'admin', body).then(res => {
              if (res.status !== 200) {
                reject(new Error('Could not set email of user'))
              }
              resolve()
            })
          })
        )
      }
    })
    .then(() => {
      return Promise.all(promiseList)
    })
}

function deleteUser(userId) {
  userSettings.deleteUserFromCreatedUsersList(userId)
  const url = `cloud/users/${userId}`
  return httpHelper.deleteOCS(url)
}

function initUser(userId) {
  const url = `cloud/users/${userId}`
  return httpHelper.getOCS(url, userId)
}

function editUser(userId, key, value) {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  value = encodeURI(value)
  const body = `key=${key}&value=${value}`

  const url = `cloud/users/${userId}`
  return httpHelper.putOCS(url, userId, body, headers)
}

/**
 *
 * @param {string} groupId
 * @returns {*|Promise}
 */
function createGroup(groupId) {
  if (client.globals.ldap) {
    return ldap.createGroup(client.globals.ldapClient, groupId).then(err => {
      if (!err) {
        userSettings.addGroupToCreatedGroupsList(groupId)
      }
    })
  }
  const body = new URLSearchParams()
  body.append('groupid', groupId)
  userSettings.addGroupToCreatedGroupsList(groupId)
  const url = 'cloud/groups'
  return httpHelper.postOCS(url, 'admin', body)
}

/**
 *
 * @param {string} groupId
 * @returns {*|Promise}
 */
function deleteGroup(groupId) {
  userSettings.deleteGroupFromCreatedGroupsList(groupId)
  const url = `cloud/groups/${groupId}`
  return httpHelper.deleteOCS(url)
}

function addToGroup(userId, groupId) {
  if (client.globals.ldap) {
    return ldap.addUserToGroup(client.globals.ldapClient, userId, groupId)
  }
  const body = new URLSearchParams()
  body.append('groupid', groupId)
  const url = `cloud/users/${userId}/groups`
  return httpHelper.postOCS(url, 'admin', body)
}

function blockUser(userId) {
  const apiURL = `cloud/users/${userId}/disable`
  return httpHelper.putOCS(apiURL, 'admin')
}

Given(
  /^user "([^"]*)" has been created with default attributes and (without|large|small) skeleton files$/,
  async function(userId, skeletonType) {
    await deleteUser(userId)
    await createDefaultUser(userId, skeletonType)
    await initUser(userId)
  }
)

Given('user {string} has been deleted', function(userId) {
  return deleteUser(userId)
})

Given('user {string} has been blocked by admin', function(userId) {
  return blockUser(userId)
})

Given('user {string} has been created with default attributes on remote server', function(userId) {
  return backendHelper.runOnRemoteBackend(async function() {
    await deleteUser()
      .then(() => createDefaultUser(userId, 'large'))
      .then(() => initUser(userId))
  })
})

Given(
  /^user "([^"]*)" has been created with default attributes and (without|large|small) skeleton files on remote server$/,
  function(userId, skeletonType) {
    return backendHelper.runOnRemoteBackend(async function() {
      await deleteUser()
        .then(() => createDefaultUser(userId, skeletonType))
        .then(() => initUser(userId))
    })
  }
)

Given('the quota of user {string} has been set to {string}', function(userId, quota) {
  const body = new URLSearchParams()
  body.append('key', 'quota')
  body.append('value', quota)
  const url = `cloud/users/${userId}`
  return httpHelper
    .putOCS(url, 'admin', body)
    .then(res => httpHelper.checkStatus(res, 'Could not set quota.'))
})

Given('these users have been created with default attributes but not initialized:', function(
  dataTable
) {
  return Promise.all(
    dataTable.rows().map(userId => {
      return deleteUser(userId.toString()).then(() => createDefaultUser(userId.toString(), 'large'))
    })
  )
})

Given(
  /^these users have been created with default attributes and (without|small|large) skeleton files but not initialized:$/,
  function(skeletonType, dataTable) {
    return Promise.all(
      dataTable.rows().map(userId => {
        return deleteUser(userId.toString()).then(() =>
          createDefaultUser(userId.toString(), skeletonType)
        )
      })
    )
  }
)

Given(
  /^these users have been created without initialization and (without|small|large) skeleton files:$/,
  function(skeletonType, dataTable) {
    codify.replaceInlineTable(dataTable)
    return Promise.all(
      dataTable.hashes().map(user => {
        const userId = user.username
        const password = user.password || userSettings.getPasswordForUser(userId)
        const displayName = user.displayname || false
        const email = user.email || false
        return deleteUser(userId).then(() =>
          createUser(userId, password, displayName, email, skeletonType)
        )
      })
    )
  }
)

Given('these users have been created with default attributes:', function(dataTable) {
  return Promise.all(
    dataTable.rows().map(user => {
      const userId = user[0]
      return deleteUser(userId)
        .then(() => createDefaultUser(userId, 'large'))
        .then(() => initUser(userId))
    })
  )
})

Given(
  /^these users have been created with default attributes and (without|small|large) skeleton files:$/,
  function(skeletonType, dataTable) {
    return Promise.all(
      dataTable.rows().map(user => {
        const userId = user[0]
        return deleteUser(userId)
          .then(() => createDefaultUser(userId, skeletonType))
          .then(() => initUser(userId))
      })
    )
  }
)

Given('group {string} has been created', function(groupId) {
  return deleteGroup(groupId.toString()).then(() => createGroup(groupId.toString()))
})

Given('these groups have been created:', function(dataTable) {
  return Promise.all(
    dataTable.rows().map(groupId => {
      return deleteGroup(groupId.toString()).then(() => createGroup(groupId.toString()))
    })
  )
})

Given('user {string} has been added to group {string}', function(userId, groupId) {
  return addToGroup(userId, groupId)
})

Given('the administrator has changed the display name of user {string} to {string}', async function(
  userId,
  newDisplayName
) {
  await editUser(userId, 'displayname', newDisplayName).then(function(res) {
    assert.strictEqual(
      res.status,
      200,
      `As admin, cannot change displayname of user "${userId}" to "${newDisplayName}"`
    )
  })
})

After(async function() {
  const createdUsers = Object.keys(userSettings.getCreatedUsers('LOCAL'))
  const createdRemoteUsers = Object.keys(userSettings.getCreatedUsers('REMOTE'))
  const createdGroups = userSettings.getCreatedGroups()

  if (client.globals.ocis) {
    const deleteSharePromises = createdUsers.map(user => {
      return sharingHelper.getAllSharesSharedByUser(user).then(shares => {
        if (shares.length) {
          return Promise.all(shares.map(share => sharingHelper.deleteShare(share.id, user)))
        }
      })
    })
    await Promise.all(deleteSharePromises).catch(err => {
      console.log('Error while deleting shares after test: ', err)
    })
  }
  if (client.globals.ldap) {
    const dataDir = user => join(client.globals.ocis_data_dir, user)
    const deleteUserPromises = createdUsers.map(user =>
      ldap.deleteUser(client.globals.ldapClient, user).then(() => {
        console.log('Deleted LDAP User: ', user)
      })
    )
    const deleteUserDirectories = createdUsers.map(user => fs.remove(dataDir(user)))
    const deleteGroupPromises = createdGroups.map(group =>
      ldap.deleteGroup(client.globals.ldapClient, group).then(() => {
        console.log('Deleted LDAP Group: ', group)
      })
    )
    await Promise.all([
      ...deleteUserPromises,
      ...deleteGroupPromises,
      ...deleteUserDirectories
    ]).then(() => {
      userSettings.resetCreatedUsers()
      userSettings.resetCreatedGroups()
    })
  } else {
    await Promise.all(createdUsers.map(deleteUser))
    await Promise.all(createdGroups.map(deleteGroup))
  }

  if (client.globals.ocis) {
    const dataDir = user => join(client.globals.ocis_data_dir, user)
    const deleteUserDirectories = createdUsers.map(user => fs.remove(dataDir(user)))
    await Promise.all(deleteUserDirectories)
  }

  if (client.globals.remote_backend_url) {
    return backendHelper.runOnRemoteBackend(() => Promise.all(createdRemoteUsers.map(deleteUser)))
  }
})
