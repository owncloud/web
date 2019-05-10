const { client } = require('nightwatch-api')
const { Given } = require('cucumber')
const fetch = require('node-fetch')
require('url-search-params-polyfill')
const httpHelper = require('../helpers/httpHelper')

function createUser (userId) {
  const body = new URLSearchParams()
  body.append('userid', userId)
  body.append('password', userId)

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

function createGroup (groupId) {
  const body = new URLSearchParams()
  body.append('groupid', groupId)

  const headers = httpHelper.createAuthHeader(client.globals.backend_admin_username)
  return fetch(client.globals.backend_url + '/ocs/v2.php/cloud/groups?format=json', { method: 'POST', body: body, headers: headers })
}

function deleteGroup (groupId) {
  const headers = httpHelper.createAuthHeader(client.globals.backend_admin_username)
  return fetch(client.globals.backend_url + '/ocs/v2.php/cloud/groups/' + groupId, { method: 'POST', headers: headers })
}

Given('user {string} has been created with default attributes', function (userId) {
  return deleteUser(userId)
    .then(() => createUser(userId))
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
      .then(() => createUser(userId))
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

Given('these groups have been created:', function (dataTable) {
  return Promise.all(dataTable.rows().map((groupId) => {
    return deleteGroup(groupId)
      .then(() => createGroup(groupId))
  }))
});
