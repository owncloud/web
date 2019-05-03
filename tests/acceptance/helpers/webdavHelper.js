const { client } = require('nightwatch-api')
const fetch = require('node-fetch')
const httpHelper = require('../helpers/httpHelper')

/**
 *
 * @param {string} userId
 * @param {string} element
 */
exports.createDavPath = function (userId, element) {
  return client.globals.backend_url +
    '/remote.php/dav/files/' + userId + '/' + encodeURIComponent(element)
    .replace('%2F', '/')
}

/**
 *
 * @param {string} userId
 * @param {string} file
 */
exports.download = function (userId, file) {
  const headers = httpHelper.createAuthHeader(userId)
  const davPath = exports.createDavPath(userId, file)
  return fetch(
    davPath,
    { method: 'GET', headers: headers }
  )
    .then(checkStatus)
    .then(res => res.text())
}

/**
 *
 * @param {ArrayBuffer} res
 */
function checkStatus (res) {
  if (res.ok) { // res.status >= 200 && res.status < 300
    return res
  } else {
    throw Error('Could not download file. Status:' + res.status + ' ' + res.statusText)
  }
}
