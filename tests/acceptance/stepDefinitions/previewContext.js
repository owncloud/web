const { client } = require('nightwatch-api')
const { Given, When, Then } = require('@cucumber/cucumber')
const mediaViewerPage = client.page.FilesPageElement.mediaViewerPage()
const filesList = client.page.FilesPageElement.filesList()
const assert = require('assert')

Given(
  'the user has viewed the file {string} in the media viewer using the webUI',
  async function (fileName) {
    await mediaViewerPage.openMediaViewer(fileName)
    return mediaViewerPage.waitForMediaViewerLoaded(fileName)
  }
)

When(
  'the user/public views the file {string} in the media viewer using the webUI',
  async function (fileName) {
    await mediaViewerPage.openMediaViewer(fileName)
    return mediaViewerPage.waitForMediaViewerLoaded(fileName)
  }
)

When('the user navigates to the next media resource using the webUI', function () {
  return mediaViewerPage.nextMediaResource()
})

When('the user navigates to the previous media resource using the webUI', function () {
  return mediaViewerPage.previousMediaResource()
})

When('the user closes the media resource using the webUI', function () {
  return mediaViewerPage.closeMediaResource()
})

When('the user downloads the media resource using the webUI', function () {
  return mediaViewerPage.downloadMediaResource()
})

Then('the file {string} should be displayed in the media viewer webUI', function (fileName) {
  return mediaViewerPage.waitForMediaViewerLoaded(fileName)
})

Then(
  'the file {string} should not be displayed in the media viewer webUI',
  async function (fileName) {
    const isPresent = await mediaViewerPage.isMediaViewerPresent(fileName)
    return assert.ok(!isPresent)
  }
)

When(
  'the user views the file {string} in the media viewer by clicking on the file name using the webUI',
  function (fileName) {
    return filesList.clickOnFileName(fileName)
  }
)
