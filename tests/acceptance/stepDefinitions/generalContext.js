const { client } = require('nightwatch-api')
const { After, Before, Given, Then, When } = require('cucumber')
const webdavHelper = require('../helpers/webdavHelper')
const httpHelper = require('../helpers/httpHelper')
const backendHelper = require('../helpers/backendHelper')
const assert = require('assert')
const fs = require('fs')
const occHelper = require('../helpers/occHelper')

let initialConfigJsonSettings

const getConfigJsonContent = function(fullPathOfConfigFile) {
  if (!fs.existsSync(fullPathOfConfigFile)) {
    throw Error('Could not find configfile')
  }
  const rawdata = fs.readFileSync(fullPathOfConfigFile)
  return JSON.parse(rawdata)
}

Given('the property {string} has been set to {string} in web config file', function(key, value) {
  const data = getConfigJsonContent(this.fullPathOfConfigFile)
  data[key] = value
  return fs.writeFileSync(this.fullPathOfConfigFile, JSON.stringify(data, null, 4))
})

function setconfig(key, subkey, value, configfile) {
  const data = getConfigJsonContent(configfile)
  if (!data[key]) {
    data[key] = {}
  }
  data[key][subkey] = value
  return fs.writeFileSync(configfile, JSON.stringify(data, null, 4))
}

Given('the property {string} of {string} has been set to {string} in web config file', function(
  subkey,
  key,
  value
) {
  return setconfig(key, subkey, value, this.fullPathOfConfigFile)
})

Given('the property {string} of {string} has been set to true in web config file', function(
  subkey,
  key
) {
  return setconfig(key, subkey, true, this.fullPathOfConfigFile)
})

Given('the property {string} of {string} has been set to false in web config file', function(
  subkey,
  key
) {
  return setconfig(key, subkey, false, this.fullPathOfConfigFile)
})

When('the property {string} of {string} is changed to true in web config file', function(
  subkey,
  key
) {
  return setconfig(key, subkey, true, this.fullPathOfConfigFile)
})

When('the property {string} of {string} is changed to false in web config file', function(
  subkey,
  key
) {
  return setconfig(key, subkey, false, this.fullPathOfConfigFile)
})

Given('the property {string} has been deleted in web config file', function(key) {
  const data = getConfigJsonContent(this.fullPathOfConfigFile)
  delete data[key]
  return fs.writeFileSync(this.fullPathOfConfigFile, JSON.stringify(data, null, 4))
})

Then('the success/error message with header {string} should be displayed on the webUI', function(
  message
) {
  return client.page
    .webPage()
    .waitForElementVisible('@message')
    .expect.element('@message')
    .text.to.equal(message)
})

Then('the following success/error message should be displayed on the webUI', async function(
  message
) {
  const displayedMessage = await client.page.webPage().getDisplayedMessage()
  assert.strictEqual(displayedMessage, message)
})

Then('a error message should be displayed on the webUI containing following text', function(
  message
) {
  return client.page
    .webPage()
    .waitForElementVisible('@messages')
    .expect.element('@messages')
    .text.to.contain(message)
})

Then('the error message {string} should be displayed on the webUI dialog prompt', function(
  message
) {
  return client.page
    .webPage()
    .waitForElementVisible('@ocDialogPromptAlert')
    .expect.element('@ocDialogPromptAlert')
    .text.to.equal(message)
})

Then('the user should see the following error message on the login card dialog', function(message) {
  return client.page
    .publicLinkPasswordPage()
    .waitForElementVisible('@loginCardDialogBox')
    .expect.element('@loginCardDialogBox')
    .text.to.equal(message)
})

When('the user clears all error message from the webUI', function() {
  return client.page.webPage().clearAllErrorMessages()
})

Then('no message should be displayed on the webUI', function() {
  return client.page.webPage().expect.element('@message').to.not.be.present
})

Then('as {string} the content of {string} should be the same as the local {string}', function(
  userId,
  remoteFile,
  localFile
) {
  const fullPathOfLocalFile = client.globals.filesForUpload + localFile
  return webdavHelper
    .download(userId, remoteFile)
    .then(body => assertContentOFLocalFileIs(fullPathOfLocalFile, body))
})

Then('as {string} the content of {string} should not be the same as the local {string}', function(
  userId,
  remoteFile,
  localFile
) {
  const fullPathOfLocalFile = client.globals.filesForUpload + localFile
  return webdavHelper
    .download(userId, remoteFile)
    .then(body => assertContentOFLocalFileIsNot(fullPathOfLocalFile, body))
})

const assertContentOFLocalFileIs = function(fullPathOflocalFile, expectedContent) {
  const actualContent = fs.readFileSync(fullPathOflocalFile, { encoding: 'utf-8' })
  return client.assert.strictEqual(
    actualContent,
    expectedContent,
    'asserting content of local file "' + fullPathOflocalFile + '"'
  )
}

const assertContentOFLocalFileIsNot = function(fullPathOflocalFile, expectedContent) {
  const actualContent = fs.readFileSync(fullPathOflocalFile, { encoding: 'utf-8' })
  return client.assert.notEqual(
    actualContent,
    expectedContent,
    'asserting content of local file "' + fullPathOflocalFile + '"'
  )
}

const assertRemoteFileSameAsSkeletonFile = async function(userId, remoteFile, skeletonFile) {
  const skeleton = await webdavHelper.getSkeletonFile(skeletonFile)
  const remote = await webdavHelper.download(userId, remoteFile)
  return client.assert.strictEqual(
    skeleton,
    remote,
    `Failed asserting remote file ${remoteFile} is same as skeleton file ${skeletonFile} for user${userId}`
  )
}

Then('as {string} the content of {string} should be the same as the original {string}', function(
  user,
  remoteFile,
  skeletonFile
) {
  return assertRemoteFileSameAsSkeletonFile(user, remoteFile, skeletonFile)
})

Given('the setting {string} of app {string} has been set to {string}', function(
  setting,
  app,
  value
) {
  if (client.globals.ocis) {
    // TODO: decide if we fail on OCIS when a scenario even tries to use this given step
    return
  }
  return occHelper.runOcc(['config:app:set', app, setting, '--value=' + value])
})

Given('the setting {string} of app {string} has been set to {string} on remote server', function(
  setting,
  app,
  value
) {
  return backendHelper.runOnRemoteBackend(occHelper.runOcc, [
    'config:app:set',
    app,
    setting,
    '--value=' + value
  ])
})

Given('the administrator has cleared the versions for user {string}', function(userId) {
  if (client.globals.ocis) {
    // TODO: decide if we fail on OCIS when a scenario even tries to use this given step
    return
  }
  return occHelper.runOcc(['versions:cleanup', userId])
})

Given('the administrator has cleared the versions for all users', function() {
  if (client.globals.ocis) {
    // TODO: decide if we fail on OCIS when a scenario even tries to use this given step
    return
  }
  return occHelper.runOcc(['versions:cleanup'])
})

const setTrustedServer = function(url) {
  const body = new URLSearchParams()
  body.append('url', url)
  const postUrl = 'apps/testing/api/v1/trustedservers'
  return httpHelper.postOCS(postUrl, 'admin', body).then(res => {
    return httpHelper.checkStatus(res)
  })
}

Given('server {code} has been added as trusted server', function(server) {
  return setTrustedServer(server)
})

Given('server {code} has been added as trusted server on remote server', function(url) {
  return backendHelper.runOnRemoteBackend(setTrustedServer, url)
})

Before(function() {
  try {
    this.fullPathOfConfigFile = client.globals.webUIConfig
    initialConfigJsonSettings = getConfigJsonContent(client.globals.webUIConfig)
  } catch (err) {
    console.log(
      '\x1b[33m%s\x1b[0m',
      `\tCould not read config file.\n\tSet correct path of config file in WEB_UI_CONFIG env variable to fix this.\n\tSome tests may fail as a result.`
    )
  }
})

After(function() {
  if (initialConfigJsonSettings) {
    fs.writeFileSync(this.fullPathOfConfigFile, JSON.stringify(initialConfigJsonSettings, null, 4))
  }
})

Given('the app {string} has been disabled', function(app) {
  if (client.globals.ocis) {
    // TODO: decide if we fail on OCIS when a scenario even tries to use this given step
    return
  }
  return occHelper.runOcc(['app:disable', app])
})

Given('default expiration date for users is set to {int} day/days', function(days) {
  if (client.globals.ocis) {
    // TODO: decide if we fail on OCIS when a scenario even tries to use this given step
    return
  }
  occHelper.runOcc([`config:app:set --value ${days} core shareapi_expire_after_n_days_user_share`])

  return this
})
