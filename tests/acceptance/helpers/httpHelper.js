const userSettings = require('../helpers/userSettings')

/**
 *
 * @param {string} userId
 *
 * @returns {string}
 */
exports.createAuthHeader = function (userId) {
  const password = userSettings.getPasswordForUser(userId)
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
