const { client } = require('nightwatch-api')
let password = ''

/**
 *
 * @param {string} userId
 *
 * @returns {string}
 */
exports.createAuthHeader = function (userId) {
  if (userId === client.globals.backend_admin_username) {
    password = client.globals.backend_admin_password
  } else {
    password = userId
  }
  return {
    'Authorization': 'Basic ' +
      Buffer.from(userId + ':' + password).toString('base64')
  }
}

/**
 *
 * @param {node-fetch.Response} response
 * @param {string} message
 *
 * @throws Error
 * @returns {node-fetch.Response}
 */
exports.checkStatus = function (response, message) {
  if (response.ok) { // response.status >= 200 && response.status < 300
    return response
  } else {
    throw Error(message + ' Status:' + response.status + ' ' + response.statusText)
  }
}
