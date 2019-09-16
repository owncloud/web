const { client } = require('nightwatch-api')
const fetch = require('node-fetch')
const httpHelper = require('../helpers/httpHelper')
const userSettings = require('../helpers/userSettings')
const convert = require('xml-js')

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

/**
 *
 * @param {string} userId
 * @param {string} file
 */
exports.delete = function (userId, file) {
  const headers = httpHelper.createAuthHeader(userId)
  const davPath = exports.createDavPath(userId, file)
  return fetch(
    davPath,
    { method: 'DELETE', headers: headers }
  )
    .then(res => httpHelper.checkStatus(res, 'Could not delete file.'))
    .then(res => res.text())
}

/**
 * Rename a file using webDAV api.
 *
 * @param {string} userId
 * @param {string} fromName
 * @param {string} toName
 */
exports.move = function (userId, fromName, toName) {
  const headers = httpHelper.createAuthHeader(userId)
  headers.Destination = exports.createDavPath(userId, toName)
  const davPath = exports.createDavPath(userId, fromName)
  return fetch(
    davPath,
    { method: 'MOVE', headers: headers }
  )
    .then(res => httpHelper.checkStatus(res, 'Could not move file.'))
    .then(res => res.text())
}

/**
 *
 * @param {string} path
 * @param {string} userId
 * @param {string} password
 * @param {array} properties
 * @param {number} folderDepth
 */
exports.propfind = function (path, userId, password, properties, folderDepth = 1) {
  const headers = httpHelper.createAuthHeader(userId)
  headers.Depth = folderDepth
  const davPath = client.globals.backend_url + '/remote.php/dav' + path
  let propertyBody = ''
  properties.map(prop => {
    propertyBody += `<${prop}/>`
  })
  const body = `<?xml version="1.0"?>
                <d:propfind
                xmlns:d="DAV:"
                xmlns:oc="http://owncloud.org/ns"
                xmlns:ocs="http://open-collaboration-services.org/ns">
                <d:prop>${propertyBody}</d:prop>
                </d:propfind>`
  return fetch(
    davPath,
    { method: 'PROPFIND', headers, body }
  )
    .then(res => res.text())
}

/**
 * Get the list of trashbin items for a user
 * in following format
 * [{
 *  "href":
 *  "originalFilename":
 *  "originalLocation":
 *  "deleteTimestamp":
 *  "lastModified":
 * },...]
 *
 * @param {string} user
 */
exports.getTrashBinElements = function (user) {
  return new Promise((resolve) => {
    exports.propfind(`/trash-bin/${user}`, user, userSettings.getPasswordForUser(user),
      [
        'oc:trashbin-original-filename',
        'oc:trashbin-original-location',
        'oc:trashbin-delete-timestamp',
        'd:getlastmodified'
      ], 2)
      .then(str => {
        const trashData = JSON.parse(convert.xml2json(str, { compact: true }))['d:multistatus']['d:response']
        const trashItems = []
        trashData.map(trash => {
          trashItems.push({
            href: trash['d:href']._text,
            originalFilename: trash['d:propstat']['d:prop']['oc:trashbin-original-filename']._text,
            originalLocation: trash['d:propstat']['d:prop']['oc:trashbin-original-location']._text,
            deleteTimestamp: trash['d:propstat']['d:prop']['oc:trashbin-delete-timestamp']._text,
            lastModified: trash['d:propstat']['d:prop']['d:getlastmodified']._text
          })
        })
        resolve(trashItems)
      })
  })
}
/**
 * Create a folder using webDAV api.
 *
 * @param {string} user
 * @param {string} folderName
 */
exports.createFolder = function (user, folderName) {
  const headers = httpHelper.createAuthHeader(user)
  const davPath = exports.createDavPath(user, folderName)
  return fetch(
    davPath,
    { method: 'MKCOL', headers: headers }
  )
    .then(res => httpHelper.checkStatus(res, `Could not create the folder "${folderName}" for user "${user}".`))
    .then(res => res.text())
}
/**
 * Create a file using webDAV api.
 *
 * @param {string} user
 * @param {string} fileName
 * @param {string} contents
 */
exports.createFile = function (user, fileName, contents = '') {
  const headers = httpHelper.createAuthHeader(user)
  const davPath = exports.createDavPath(user, fileName)
  return fetch(
    davPath,
    { method: 'PUT', headers: headers, body: contents }
  )
    .then(res => httpHelper.checkStatus(res, `Could not create the file "${fileName}" for user "${user}".`))
    .then(res => res.text())
}
