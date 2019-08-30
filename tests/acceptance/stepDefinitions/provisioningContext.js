const { client } = require('nightwatch-api')
const { Given, After } = require('cucumber')
const fetch = require('node-fetch')
require('url-search-params-polyfill')
const httpHelper = require('../helpers/httpHelper')
const userSettings = require('../helpers/userSettings')

function createDefaultUser (userId) {
  const password = userSettings.getPasswordForUser(userId)
  const displayname = userSettings.getDisplayNameOfDefaultUser(userId)
  const email = userSettings.getEmailAddressOfDefaultUser(userId)
  return createUser(userId, password, displayname, email)
}

function createUser (userId, password, displayName = false, email = false) {
  const body = new URLSearchParams()
  body.append('userid', userId)
  body.append('password', password)
  const promiseList = []

  userSettings.addUserToCreatedUsersList(userId, password, displayName, email)
  const headers = httpHelper.createAuthHeader(client.globals.backend_admin_username)
  return fetch(client.globals.backend_url + '/ocs/v2.php/cloud/users?format=json',
    { method: 'POST', body: body, headers: headers }
  )
    .then(() => {
      if (displayName !== false) {
        promiseList.push(new Promise((resolve, reject) => {
          const body = new URLSearchParams()
          body.append('key', 'display')
          body.append('value', displayName)
          fetch(`${client.globals.backend_url}/ocs/v2.php/cloud/users/${encodeURIComponent(userId)}?format=json`,
            { method: 'PUT', body: body, headers: headers }
          )
            .then(res => {
              if (res.status !== 200) {
                reject(new Error('Could not set display name of user'))
              }
              resolve(res)
            })
        }))
      }
    })
    .then(() => {
      if (email !== false) {
        promiseList.push(new Promise((resolve, reject) => {
          const body = new URLSearchParams()
          body.append('key', 'email')
          body.append('value', email)
          fetch(`${client.globals.backend_url}/ocs/v2.php/cloud/users/${encodeURIComponent(userId)}?format=json`,
            { method: 'PUT', body: body, headers: headers }
          )
            .then(res => {
              if (res.status !== 200) {
                reject(new Error('Could not set email of user'))
              }
              resolve()
            })
        }))
      }
    })
    .then(() => {
      return Promise.all(promiseList)
    })
}

function deleteUser (userId) {
  const headers = httpHelper.createAuthHeader(client.globals.backend_admin_username)
  userSettings.deleteUserFromCreatedUsersList(userId)
  return fetch(client.globals.backend_url + '/ocs/v2.php/cloud/users/' + userId, { method: 'DELETE', headers: headers })
}

function initUser (userId) {
  const headers = httpHelper.createAuthHeader(userId)
  return fetch(client.globals.backend_url + '/ocs/v2.php/cloud/users/' + userId, { method: 'GET', headers: headers })
}

/**
 *
 * @param {string} groupId
 * @returns {*|Promise}
 */
function createGroup (groupId) {
  const body = new URLSearchParams()
  body.append('groupid', groupId)
  userSettings.addGroupToCreatedGroupsList(groupId)
  const headers = httpHelper.createAuthHeader(client.globals.backend_admin_username)
  return fetch(client.globals.backend_url + '/ocs/v2.php/cloud/groups?format=json', {
    method: 'POST',
    body: body,
    headers: headers
  })
}

/**
 *
 * @param {string} groupId
 * @returns {*|Promise}
 */
function deleteGroup (groupId) {
  const headers = httpHelper.createAuthHeader(client.globals.backend_admin_username)
  userSettings.deleteGroupFromCreatedGroupsList(groupId)
  return fetch(client.globals.backend_url + '/ocs/v2.php/cloud/groups/' + groupId, { method: 'DELETE', headers: headers })
}

function addToGroup (userId, groupId) {
  const body = new URLSearchParams()
  body.append('groupid', groupId)

  const headers = httpHelper.createAuthHeader(client.globals.backend_admin_username)
  return fetch(`${client.globals.backend_url}/ocs/v2.php/cloud/users/${userId}/groups`,
    { method: 'POST', body: body, headers: headers }
  )
}

Given('user {string} has been created with default attributes', function (userId) {
  return deleteUser(userId)
    .then(() => createDefaultUser(userId))
    .then(() => initUser(userId))
})

Given('the quota of user {string} has been set to {string}', function (userId, quota) {
  const headers = httpHelper.createAuthHeader(client.globals.backend_admin_username)
  const body = new URLSearchParams()
  body.append('key', 'quota')
  body.append('value', quota)

  return fetch(
    client.globals.backend_url + '/ocs/v2.php/cloud/users/' + userId,
    { method: 'PUT', body: body, headers: headers }
  )
    .then(res => httpHelper.checkStatus(res, 'Could not set quota.'))
})

Given('these users have been created with default attributes but not initialized:', function (dataTable) {
  return Promise.all(dataTable.rows().map((userId) => {
    return deleteUser(userId)
      .then(() => createDefaultUser(userId))
  }))
})

Given('these users have been created but not initialized:', function (dataTable) {
  return Promise.all(dataTable.hashes().map((user) => {
    const userId = user.username
    const password = user.password || userSettings.getPasswordForUser(userId)
    const displayName = user.displayname || false
    const email = user.email || false
    return deleteUser(userId)
      .then(() => createUser(userId, password, displayName, email))
  }))
})

Given('these users have been created with default attributes:', function (dataTable) {
  return Promise.all(dataTable.rows().map((user) => {
    const userId = user[0]
    return deleteUser(userId)
      .then(() => createDefaultUser(userId))
      .then(() => initUser(userId))
  }))
})

Given('group {string} has been created', function (groupId) {
  return deleteGroup(groupId.toString())
    .then(() => createGroup(groupId.toString()))
})

Given('these groups have been created:', function (dataTable) {
  return Promise.all(dataTable.rows().map((groupId) => {
    return deleteGroup(groupId.toString())
      .then(() => createGroup(groupId.toString()))
  }))
})

Given('user {string} has been added to group {string}', function (userId, groupId) {
  return addToGroup(userId, groupId)
})

After(function () {
  for (var userId in userSettings.getCreatedUsers()) {
    deleteUser(userId)
  }
  userSettings.getCreatedGroups().forEach(function (groupId) {
    deleteGroup(groupId)
  })
})
