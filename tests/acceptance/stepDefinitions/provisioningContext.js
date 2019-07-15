const { client } = require('nightwatch-api')
const { Given, After } = require('cucumber')
const fetch = require('node-fetch')
require('url-search-params-polyfill')
const httpHelper = require('../helpers/httpHelper')
const userSettings = require('../helpers/userSettings')

function createDefaultUser (userId) {
  const password = userSettings.getPasswordForUser(userId)
  return new Promise((resolve, reject) => {
    createUser(userId, password)
      .then(() => {
        const displayname = userSettings.getDisplayNameOfDefaultUser(userId)
        const email = userSettings.getEmailAddressOfDefaultUser(userId)

        // update displayname and email in the created users list
        userSettings.addUserToCreatedUsersList(userId, password, displayname, email)
        const body = new URLSearchParams()
        body.append('key', 'display')
        body.append('value', displayname)
        const headers = httpHelper.createAuthHeader(client.globals.backend_admin_username)
        fetch(`${client.globals.backend_url}/ocs/v2.php/cloud/users/${encodeURIComponent(userId)}?format=json`,
          { method: 'PUT', body: body, headers: headers }
        )
          .then(res => {
            if (res.status !== 200) {
              reject(new Error('Could not set display name of user'))
            }
          })
          .then(() => {
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
          })
      })
  })
}

function createUser (userId, password = false) {
  const body = new URLSearchParams()
  const userPassword = password || userSettings.getPasswordForUser(userId)
  body.append('userid', userId)
  body.append('password', userPassword)

  userSettings.addUserToCreatedUsersList(userId, userPassword)
  const headers = httpHelper.createAuthHeader(client.globals.backend_admin_username)
  return fetch(client.globals.backend_url + '/ocs/v2.php/cloud/users?format=json', { method: 'POST', body: body, headers: headers })
}

function deleteUser (userId) {
  const headers = httpHelper.createAuthHeader(client.globals.backend_admin_username)
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
  return fetch(client.globals.backend_url + '/ocs/v2.php/cloud/groups?format=json', { method: 'POST', body: body, headers: headers })
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
  return Promise.all(dataTable.rows().map((user) => {
    // TODO: handle displayname and email
    let userId = user[0]
    return deleteUser(userId)
      .then(() => createUser(userId))
  }))
})

Given('these users have been created with default attributes:', function (dataTable) {
  return Promise.all(dataTable.rows().map((user) => {
    let userId = user[0]
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
