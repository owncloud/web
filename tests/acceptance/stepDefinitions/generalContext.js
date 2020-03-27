const { client } = require('nightwatch-api')
const { After, Before, Given, Then, When } = require('cucumber')
const webdavHelper = require('../helpers/webdavHelper')
const httpHelper = require('../helpers/httpHelper')
const backendHelper = require('../helpers/backendHelper')
const fs = require('fs')
const path = require('path')
const occHelper = require('../helpers/occHelper')

let initialConfigJsonSettings
let createdFiles = []

Given('a file with the size of {string} bytes and the name {string} has been created locally', function (size, name) {
  const fullPathOfLocalFile = client.globals.filesForUpload + name
  const fh = fs.openSync(fullPathOfLocalFile, 'w')
  fs.writeSync(fh, 'A', Math.max(0, size - 1))
  fs.closeSync(fh)
  createdFiles.push(fullPathOfLocalFile)
})

const getConfigJsonContent = function (fullPathOfConfigFile) {
  const rawdata = fs.readFileSync(fullPathOfConfigFile)
  return JSON.parse(rawdata)
}

Given('the property {string} has been set to {string} in phoenix config file', function (key, value) {
  const data = getConfigJsonContent(this.fullPathOfConfigFile)
  data[key] = value
  return fs.writeFileSync(this.fullPathOfConfigFile, JSON.stringify(data, null, 4))
})

Given('the property {string} has been deleted in phoenix config file', function (key) {
  const data = getConfigJsonContent(this.fullPathOfConfigFile)
  delete data[key]
  return fs.writeFileSync(this.fullPathOfConfigFile, JSON.stringify(data, null, 4))
})

Then('the success/error message with header {string} should be displayed on the webUI', function (message) {
  return client
    .page.phoenixPage()
    .waitForElementVisible('@message')
    .expect.element('@message').text.to.equal(message)
})

Then('the following success/error message should be displayed on the webUI', function (message) {
  return client
    .page.phoenixPage()
    .waitForElementVisible('@messages')
    .expect.element('@messages').text.to.equal(message)
})

Then('the error message {string} should be displayed on the webUI dialog prompt', function (message) {
  return client
    .page.phoenixPage()
    .waitForElementVisible('@ocDialogPromptAlert')
    .expect.element('@ocDialogPromptAlert').text.to.equal(message)
})

Then('the user should see the following error message on the login card dialog', function (message) {
  return client
    .page.publicLinkPasswordPage()
    .waitForElementVisible('@loginCardDialogBox')
    .expect.element('@loginCardDialogBox').text.to.equal(message)
})

When('the user clears all error message from the webUI', function () {
  return client
    .page.phoenixPage()
    .clearAllErrorMessages()
})

Then('no message should be displayed on the webUI', function () {
  return client
    .page.phoenixPage()
    .expect.element('@message').to.not.be.present
})

Then('as {string} the content of {string} should be the same as the local {string}', function (userId, remoteFile, localFile) {
  const fullPathOfLocalFile = client.globals.filesForUpload + localFile
  return webdavHelper
    .download(userId, remoteFile)
    .then(body => assertContentOFLocalFileIs(fullPathOfLocalFile, body))
})

Then('as {string} the content of {string} should not be the same as the local {string}', function (userId, remoteFile, localFile) {
  const fullPathOfLocalFile = client.globals.filesForUpload + localFile
  return webdavHelper
    .download(userId, remoteFile)
    .then(body => assertContentOFLocalFileIsNot(fullPathOfLocalFile, body))
})

const assertContentOFLocalFileIs = function (fullPathOflocalFile, expectedContent) {
  const actualContent = fs.readFileSync(fullPathOflocalFile, { encoding: 'utf-8' })
  return client.assert.strictEqual(
    actualContent, expectedContent, 'asserting content of local file "' + fullPathOflocalFile + '"'
  )
}

const assertContentOFLocalFileIsNot = function (fullPathOflocalFile, expectedContent) {
  const actualContent = fs.readFileSync(fullPathOflocalFile, { encoding: 'utf-8' })
  return client.assert.notEqual(
    actualContent, expectedContent, 'asserting content of local file "' + fullPathOflocalFile + '"'
  )
}

const assertRemoteFileSameAsSkeletonFile = async function (userId, remoteFile, skeletonFile) {
  const skeleton = await webdavHelper.getSkeletonFile(skeletonFile)
  const remote = await webdavHelper.download(userId, remoteFile)
  return client.assert.strictEqual(
    skeleton, remote, `Failed asserting remote file ${remoteFile} is same as skeleton file ${skeletonFile} for user${userId}`
  )
}

Then('as {string} the content of {string} should be the same as the original {string}', function (user, remoteFile, skeletonFile) {
  return assertRemoteFileSameAsSkeletonFile(user, remoteFile, skeletonFile)
})

Given('the setting {string} of app {string} has been set to {string}', function (setting, app, value) {
  return occHelper.runOcc(
    [
      'config:app:set', app, setting, '--value=' + value
    ])
})

Given('the setting {string} of app {string} has been set to {string} on remote server', function (setting, app, value) {
  return backendHelper.runOnRemoteBackend(occHelper.runOcc, [
    'config:app:set', app, setting, '--value=' + value
  ])
})

Given('the administrator has cleared the versions for user {string}', function (userId) {
  return occHelper.runOcc(
    [
      'versions:cleanup', userId
    ])
})

Given('the administrator has cleared the versions for all users', function () {
  return occHelper.runOcc(
    [
      'versions:cleanup'
    ])
})

const setTrustedServer = function (url) {
  const body = new URLSearchParams()
  body.append('url', url)
  const postUrl = 'apps/testing/api/v1/trustedservers'
  return httpHelper.postOCS(postUrl, 'admin', body)
    .then(res => {
      return httpHelper.checkStatus(res)
    })
}

Given('server {code} has been added as trusted server', function (server) {
  return setTrustedServer(server)
})

Given('server {code} has been added as trusted server on remote server', function (url) {
  return backendHelper.runOnRemoteBackend(setTrustedServer, url)
})

Before(function (testCase) {
  createdFiles = []
  if (typeof process.env.SCREEN_RESOLUTION !== 'undefined' && process.env.SCREEN_RESOLUTION.trim() !== '') {
    const resolution = process.env.SCREEN_RESOLUTION.split('x')
    resolution[0] = parseInt(resolution[0])
    resolution[1] = parseInt(resolution[1])
    if (resolution[0] > 1 && resolution[1] > 1) {
      client.resizeWindow(resolution[0], resolution[1])
      console.log('\nINFO: setting screen resolution to ' + resolution[0] + 'x' + resolution[1] + '\n')
    } else {
      console.warn('\nWARNING: invalid resolution given, running tests in full resolution!\n')
      client.maximizeWindow()
    }
  } else {
    client.maximizeWindow()
  }
  console.log('  ' + testCase.sourceLocation.uri + ':' + testCase.sourceLocation.line + '\n')
})

After(async function (testCase) {
  if (client.globals.ocis) {
    return
  }
  console.log('\n  Result: ' + testCase.result.status + '\n')

  createdFiles.forEach(fileName => fs.unlinkSync(fileName))

  // clear file locks
  const body = new URLSearchParams()
  body.append('global', 'true')
  const url = 'apps/testing/api/v1/lockprovisioning'
  await httpHelper.deleteOCS(url, 'admin', body)
})

Before(function () {
  if (client.globals.ocis) {
    if (client.globals.ocis_phoenix_config) {
      this.fullPathOfConfigFile = client.globals.ocis_phoenix_config
      initialConfigJsonSettings = getConfigJsonContent(this.fullPathOfConfigFile)
    }
    return
  }
  if (client.globals.openid_login) {
    if (client.globals.ocOpenidConfig) {
      this.fullPathOfConfigFile = client.globals.ocis_phoenix_config
      initialConfigJsonSettings = getConfigJsonContent(this.fullPathOfConfigFile)
    }
    return
  }
  this.fullPathOfConfigFile = path.join(__dirname, '/../../../dist/config.json')
  initialConfigJsonSettings = getConfigJsonContent(this.fullPathOfConfigFile)
})

After(function () {
  if (client.globals.ocis || client.globals.openid_login) {
    return
  }
  fs.writeFileSync(this.fullPathOfConfigFile,
    JSON.stringify(initialConfigJsonSettings, null, 4))
})

Given('the app {string} has been disabled', function (app) {
  return occHelper.runOcc(
    [
      'app:disable', app
    ])
})

Given('default expiration date for users is set to {int} day/days', function (days) {
  occHelper.runOcc(
    [
      `config:app:set --value ${days} core shareapi_expire_after_n_days_user_share`
    ]
  )

  return this
})
