const { Given, Then } = require('@cucumber/cucumber')
require('url-search-params-polyfill')
const httpHelper = require('../helpers/httpHelper')
const backendHelper = require('../helpers/backendHelper')
const webdavHelper = require('../helpers/webdavHelper')
const { client } = require('nightwatch-api')
const { xml2js } = require('xml-js')
const _ = require('lodash')
const assert = require('assert')
const path = require('../helpers/path')

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

/**
 * request a single file
 * @param {string} userId - username
 * @param {string} element - path
 * @returns {Promise<Response|Error>}
 */
function getFile(userId, element) {
  const davPath = webdavHelper.createDavPath(userId, element)
  return httpHelper.get(davPath, userId)
}

const fileShouldHaveContent = async function(userId, file, content) {
  const textContent = await getFile(userId, file).then(res => res.text())
  return assert.strictEqual(
    textContent,
    content,
    `File should have content "${content}", but found "${textContent}"`
  )
}

const fileShouldNotHaveContent = async function(userId, file, content) {
  const textContent = await getFile(userId, file).then(res => res.text())
  return assert.notStrictEqual(
    textContent,
    content,
    `File should not have content "${content}", but found`
  )
}

const getResourceType = function(data) {
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

const assertResourceType = function(data, resource, type = 'file') {
  type = type.toLowerCase()

  const foundType = getResourceType(data)

  const exists = foundType === type
  assert.strictEqual(
    exists,
    true,
    `Expected "${resource}" to be a "${type}", but found "${foundType}"`
  )
}

const fileOrFolderShouldExist = function(userId, element, type = 'file') {
  return fileExists(userId, element)
    .then(function(res) {
      assert.strictEqual(res.status, 207, `Resource "${element}" should exist, but does not`)
      return res.text()
    })
    .then(function(data) {
      assertResourceType(data, element, type)
    })
}

const fileShouldNotExist = function(userId, element) {
  return fileExists(userId, element).then(function(res) {
    assert.ok(res.status < 300 || res.status >= 200, 'file/folder should not exist, but does')
  })
}

Then('as {string} file/folder {string} should not exist', function(userId, element) {
  return fileShouldNotExist(userId, element)
})

Then('as {string} file/folder {string} should not exist on remote server', function(
  userId,
  element
) {
  return backendHelper.runOnRemoteBackend(fileShouldNotExist, userId, element)
})

Then(/^as "([^"]*)" (file|folder) "([^"]*)" should exist$/, function(
  userId,
  resourceType,
  element
) {
  return fileOrFolderShouldExist(userId, element, resourceType)
})

Then(/^as "([^"]*)" (file|folder) "([^"]*)" should exist on remote server$/, function(
  userId,
  resourceType,
  element
) {
  return backendHelper.runOnRemoteBackend(fileOrFolderShouldExist, userId, element, resourceType)
})

Then(/^as "([^"]*)" (file|folder) "([^"]*)" should exist inside folder "([^"]*)"$/, function(
  user,
  resourceType,
  file,
  folder
) {
  return fileOrFolderShouldExist(user, path.join(folder, file), resourceType)
})

Then('as {string} the last uploaded folder should exist', function(userId) {
  return fileOrFolderShouldExist(userId, client.sessionId, 'folder')
})

Then(
  'as {string} the last uploaded folder should contain the following files inside the sub-folders:',
  async function(user, files) {
    files = files.raw().map(item => item[0])

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

    const uploadedFilesHref = elements.map(elem => _.get(elem, 'd:href._text')).filter(item => item)

    const regexToExtractBaseName = RegExp(`/${sessionId}/upload[0-9]+file/(.*)`)
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

Given('user {string} has favorited element {string}', function(userId, element) {
  const body =
    '<?xml version="1.0"?>\n' +
    '<d:propertyupdate xmlns:d="DAV:"\n' +
    'xmlns:oc="http://owncloud.org/ns">\n' +
    '  <d:set>\n' +
    '   <d:prop><oc:favorite>true</oc:favorite></d:prop>\n' +
    '  </d:set>\n' +
    '</d:propertyupdate>'

  return httpHelper
    .proppatch(webdavHelper.createDavPath(userId, element), userId, body)
    .then(function(res) {
      if (res.status === 207) {
        return res
      } else {
        throw Error('file/folder could not be favorited')
      }
    })
})

Then('as {string} file/folder {string} should exist in the trashbin', async function(
  user,
  element
) {
  const items = await webdavHelper.getTrashBinElements(user)
  const trashFiles = items.map(item => item.originalFilename)
  assert.strictEqual(trashFiles.includes(element), true)
})

Then(
  'as {string} the file/folder with original path {string} should not exist in the trashbin',
  function(user, path) {
    return webdavHelper.getTrashBinElements(user).then(items => {
      const trashFiles = items.map(item => item.originalLocation)
      assert.strictEqual(trashFiles.includes(path), false)
    })
  }
)

Then(
  'as {string} the file/folder with original path {string} should exist in the trashbin',
  function(user, path) {
    return webdavHelper.getTrashBinElements(user).then(items => {
      const trashFiles = items.map(item => item.originalLocation)
      assert.strictEqual(trashFiles.includes(path), true)
    })
  }
)

Then('as {string} the file {string} should have the content {string}', function(
  user,
  file,
  content
) {
  return fileShouldHaveContent(user, file, content)
})

Then('as {string} the file {string} should not have the content {string}', function(
  user,
  file,
  content
) {
  return fileShouldNotHaveContent(user, file, content)
})
