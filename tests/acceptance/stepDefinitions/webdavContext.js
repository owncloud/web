const { Given, Then } = require('cucumber')
const fetch = require('node-fetch')
require('url-search-params-polyfill')
const httpHelper = require('../helpers/httpHelper')
const webdavHelper = require('../helpers/webdavHelper')
const { client } = require('nightwatch-api')
const { xml2js } = require('xml-js')
const _ = require('lodash')
const assert = require('assert')

/**
 * Check if file exists using webdav requests
 * @param {string} userId - username
 * @param {string} element - path
 * @returns {Promise<Response|Error>}
 */
function fileExists (userId, element) {
  const headers = httpHelper.createAuthHeader(userId)
  return fetch(
    webdavHelper.createDavPath(userId, element),
    { method: 'GET', headers: headers }
  )
    .then(function (res) {
      if (res.status === 200) {
        return res
      } else {
        throw Error('file/folder should exist, but does not')
      }
    })
}

Then('as {string} file/folder {string} should exist', function (userId, element) {
  return fileExists(userId, element)
})

Then('as {string} the last uploaded folder should exist', function (userId) {
  return fileExists(userId, client.sessionId)
})

Then(
  'as {string} the last uploaded folder should contain the following files inside the sub-folders:',
  async function (user, files) {
    files = files.raw().map(item => item[0])

    const sessionId = client.sessionId
    const response = await webdavHelper.propfind(
      `/files/${user}/${sessionId}`,
      user,
      [],
      2
    )
    const result = xml2js(response, { compact: true })

    const elements = _.get(result, 'd:multistatus.d:response')
    if (elements === undefined) {
      throw new Error('Received unexpected response:\n' + result)
    }

    const uploadedFilesHref = elements
      .map(elem => _.get(elem, 'd:href._text'))
      .filter(item => item)

    const regexToExtractBaseName = RegExp(
      `/${sessionId}/upload[0-9]+file/(.*)`
    )
    const uploadedFilesWithBaseName = uploadedFilesHref
      // unmatched items return null, else is array
      .map(file => _.nth(file.match(regexToExtractBaseName), 1))
      .filter(item => item)

    const filesNotFoundInUploads = _.difference(files, uploadedFilesWithBaseName)
    assert.strictEqual(
      filesNotFoundInUploads.length,
      0,
      'Could not find following files inside sub-folders of the session folder\n' +
        filesNotFoundInUploads
    )
  }
)

Then('as {string} file/folder {string} should not exist', function (userId, element) {
  const headers = httpHelper.createAuthHeader(userId)
  return fetch(
    webdavHelper.createDavPath(userId, element),
    { method: 'GET', headers: headers }
  )
    .then(function (res) {
      if (res.status === 401 || res.status === 404) {
        return res
      } else {
        throw Error('file/folder should not exist, but does')
      }
    })
})

Given('user {string} has favorited element {string}', function (userId, element) {
  const headers = httpHelper.createAuthHeader(userId)
  const body = '<?xml version="1.0"?>\n' +
    '<d:propertyupdate xmlns:d="DAV:"\n' +
    'xmlns:oc="http://owncloud.org/ns">\n' +
    '  <d:set>\n' +
    '   <d:prop><oc:favorite>true</oc:favorite></d:prop>\n' +
    '  </d:set>\n' +
    '</d:propertyupdate>'

  return fetch(
    webdavHelper.createDavPath(userId, element),
    { method: 'PROPPATCH', headers: headers, body: body }
  )
    .then(function (res) {
      if (res.status === 207) {
        return res
      } else {
        throw Error('file/folder could not be favorited')
      }
    })
})

Then('as {string} file/folder {string} should exist in trash', function (user, element) {
  return webdavHelper.getTrashBinElements(user)
    .then(items => {
      const trashFiles = items.map(item => item.originalFilename)
      assert.strictEqual(trashFiles.includes(element), true)
    })
})

Then('as {string} the file/folder with original path {string} should not exist in trash', function (user, path) {
  return webdavHelper.getTrashBinElements(user)
    .then(items => {
      const trashFiles = items.map(item => item.originalLocation)
      assert.strictEqual(trashFiles.includes(path), false)
    })
})

Then('as {string} the file/folder with original path {string} should exist in trash', function (user, path) {
  return webdavHelper.getTrashBinElements(user)
    .then(items => {
      const trashFiles = items.map(item => item.originalLocation)
      assert.strictEqual(trashFiles.includes(path), true)
    })
})
