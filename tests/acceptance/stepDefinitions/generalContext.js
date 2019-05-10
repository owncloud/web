const { client } = require('nightwatch-api')
const { After, Before, Given, Then } = require('cucumber')
const webdavHelper = require('../helpers/webdavHelper')
const fs = require('fs')
let createdFiles = []

Given('a file with the size of {string} bytes and the name {string} has been created locally', function (size, name) {
  const fullPathOflocalFile = client.globals.filesForUpload + name
  const fh = fs.openSync(fullPathOflocalFile, 'w')
  fs.writeSync(fh, 'A', Math.max(0, size - 1))
  fs.closeSync(fh)
  createdFiles.push(fullPathOflocalFile)
})

Then('the error message {string} should be displayed on the webUI', function (folder) {
  return client
    .page.phoenixPage()
    .waitForElementVisible('@message')
    .expect.element('@message').text.to.equal(folder)
})

Then('the error message {string} should be displayed on the webUI dialog prompt', function (message) {
  return client
    .page.phoenixPage()
    .waitForElementVisible('@ocDialogPromptAlert')
    .expect.element('@ocDialogPromptAlert').text.to.equal(message)
})

Then('no notification should be displayed on the webUI', function () {
  return client
    .page.phoenixPage()
    .expect.element('@message').to.not.be.present
})

Then('as {string} the content of {string} should be the same as the local {string}', function (userId, remoteFile, localFile) {
  const fullPathOflocalFile = client.globals.filesForUpload + localFile
  return webdavHelper
    .download(userId, remoteFile)
    .then(body => assertContentOFLocalFileIs(fullPathOflocalFile, body))
})

const assertContentOFLocalFileIs = function (fullPathOflocalFile, expectedContent) {
  const actualContent = fs.readFileSync(fullPathOflocalFile, { encoding: 'utf-8' })
  return client.assert.strictEqual(
    actualContent, expectedContent, 'asserting content of local file "' + fullPathOflocalFile + '"'
  )
}

Before(function (client) {
  createdFiles = []
})

After(function (client) {
  createdFiles.forEach(fileName => fs.unlinkSync(fileName))
})
