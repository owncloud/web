const { Then } = require('@cucumber/cucumber')
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
function fileExists(userId, element) {
  const davPath = webdavHelper.createDavPath(userId, element)
  return httpHelper.propfind(davPath, userId)
}

const getResourceType = function (data) {
  let resourceType

  const result = xml2js(data, { compact: true })
  const responses = _.get(result, 'd:multistatus.d:response')
  if (responses instanceof Array) {
    resourceType = _.get(responses[0], 'd:propstat.d:prop.d:resourcetype')
  } else {
    resourceType = _.get(responses, 'd:propstat.d:prop.d:resourcetype')
  }

  if (Object.keys(resourceType)[0] === 'd:collection') {
    return 'folder'
  } else {
    return 'file'
  }
}

const assertResourceType = function (data, resource, type = 'file') {
  type = type.toLowerCase()

  const foundType = getResourceType(data)

  const exists = foundType === type
  assert.strictEqual(
    exists,
    true,
    `Expected "${resource}" to be a "${type}", but found "${foundType}"`
  )
}

const fileOrFolderShouldExist = function (userId, element, type = 'file') {
  return fileExists(userId, element)
    .then(function (res) {
      assert.strictEqual(res.status, 207, `Resource "${element}" should exist, but does not`)
      return res.text()
    })
    .then(function (data) {
      assertResourceType(data, element, type)
    })
}

Then('as {string} the last uploaded folder should exist', function (userId) {
  return fileOrFolderShouldExist(userId, client.sessionId, 'folder')
})

Then(
  'as {string} the last uploaded folder should contain the following files inside the sub-folders:',
  async function (user, files) {
    files = files.raw().map((item) => item[0])

    const sessionId = client.sessionId
    const response = await webdavHelper.propfind(
      `/files/${user}/${sessionId}`,
      user,
      [],
      'infinity'
    )
    const result = xml2js(response, { compact: true })

    const elements = _.get(result, 'd:multistatus.d:response')
    if (elements === undefined) {
      throw new Error('Received unexpected response:\n' + result)
    }

    const uploadedFilesHref = elements
      .map((elem) => _.get(elem, 'd:href._text'))
      .filter((item) => item)

    const regexToExtractBaseName = RegExp(`/${sessionId}/upload[0-9]+file/(.*)`)
    const uploadedFilesWithBaseName = uploadedFilesHref
      // unmatched items return null, else is array
      .map((file) => _.nth(file.match(regexToExtractBaseName), 1))
      .filter((item) => item)

    const filesNotFoundInUploads = _.difference(files, uploadedFilesWithBaseName)
    assert.strictEqual(
      filesNotFoundInUploads.length,
      0,
      'Could not find following files inside sub-folders of the session folder\n' +
        filesNotFoundInUploads
    )
  }
)
