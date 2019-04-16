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

Given('user {string} has been created with default attributes', function (userId) {
  return deleteUser(userId)
    .then(() => createUser(userId))
    .then(() => initUser(userId))
})
