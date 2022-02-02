const httpHelper = require('../helpers/httpHelper')
const convert = require('xml-js')
const _ = require('lodash/object')
const { normalize } = require('../helpers/path')

/**
 *
 * @param {string} userId
 * @param {string} element
 */
exports.createDavPath = function (userId, element) {
  const replaceEncoded = encodeURIComponent(element).replace(/%2F/g, '/')
  return `files/${userId}/${replaceEncoded}`
}

/**
 *
 * @param {string} path
 * @param {string} userId
 * @param {array} properties
 * @param {number} folderDepth
 */
exports.propfind = function (path, userId, properties, folderDepth = '1') {
  const davPath = encodeURI(path)
  let propertyBody = ''
  properties.forEach((prop) => {
    propertyBody += `<${prop}/>`
  })
  const body = `<?xml version="1.0"?>
                <d:propfind
                xmlns:d="DAV:"
                xmlns:oc="http://owncloud.org/ns"
                xmlns:ocs="http://open-collaboration-services.org/ns">
                <d:prop>${propertyBody}</d:prop>
                </d:propfind>`
  return httpHelper
    .propfind(davPath, userId, body, { Depth: folderDepth })
    .then((res) => res.text())
}

/**
 * Get file or folder properties using webDAV api.
 *
 * @param {string} path
 * @param {string} userId
 * @param {array} requestedProps
 */
exports.getProperties = function (path, userId, requestedProps) {
  return new Promise((resolve, reject) => {
    const trimmedPath = normalize(path) // remove a leading slash
    const relativePath = `/files/${userId}/${trimmedPath}`
    exports.propfind(relativePath, userId, requestedProps, 0).then((str) => {
      const response = JSON.parse(convert.xml2json(str, { compact: true }))
      const receivedProps = _.get(
        response,
        "['d:multistatus']['d:response']['d:propstat']['d:prop']"
      )
      if (receivedProps === undefined) {
        const errMsg = "Could not find 'd:prop' inside response. Received:\n"
        return reject(new Error(errMsg + JSON.stringify(str)))
      }
      const properties = {}
      requestedProps.forEach((propertyName) => {
        properties[propertyName] = receivedProps[propertyName]._text
      })
      return resolve(properties)
    })
  })
}
