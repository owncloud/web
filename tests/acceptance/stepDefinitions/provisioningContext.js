const { client } = require('nightwatch-api')
const { Given } = require('cucumber')
const fetch = require('node-fetch')
require('url-search-params-polyfill')

function createUser (userId) {
  const body = new URLSearchParams()
  body.append('userid', userId)
  body.append('password', userId)

  const headers = {
    'Authorization': 'Basic ' + Buffer.from(client.globals.backend_admin_username + ':' + client.globals.backend_admin_password).toString('base64')
  }
  return fetch(client.globals.backend_url + '/ocs/v2.php/cloud/users?format=json', { method: 'POST', body: body, headers: headers })
}

function deleteUser (userId) {
  const headers = {
    'Authorization': 'Basic ' + Buffer.from(client.globals.backend_admin_username + ':' + client.globals.backend_admin_password).toString('base64')
  }
  return fetch(client.globals.backend_url + '/ocs/v2.php/cloud/users/' + userId, { method: 'DELETE', headers: headers })
}

Given('user {string} has been created with default attributes', function (userId) {
  return deleteUser(userId)
    .then(() => createUser(userId))
})
