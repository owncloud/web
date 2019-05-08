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
    .then(res => httpHelper.checkStatus(res, 'Could not download file.'))
    .then(res => res.text())
}
