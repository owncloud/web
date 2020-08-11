const { client } = require('nightwatch-api')
const { Given, When, Then } = require('cucumber')
const offCanvasPage = client.page.FilesPageElement.offCanvasPage()
const filesList = client.page.FilesPageElement.filesList()
const assert = require('assert')

Given('the user has viewed the file {string} in the media viewer using the webUI', async function(
  fileName
) {
  await filesList.clickOnFileName(fileName)
  await offCanvasPage.openMediaViewer()
  return offCanvasPage.waitForMediaViewerLoaded(fileName)
})

When('the user/public views the file {string} in the mediaviewer using the webUI', async function(
  fileName
) {
  await filesList.clickOnFileName(fileName)
  return offCanvasPage.openMediaViewer()
})

When('the user navigates to the next media resource using the webUI', function() {
  return offCanvasPage.nextMediaResource()
})

When('the user navigates to the previous media resource using the webUI', function() {
  return offCanvasPage.previousMediaResource()
})

When('the user closes the media resource using the webUI', function() {
  return offCanvasPage.closeMediaResource()
})

When('the user downloads the media resource using the webUI', function() {
  return offCanvasPage.downloadMediaResource()
})

Then('the file {string} should be displayed in the mediaViewer', function(fileName) {
  return offCanvasPage.waitForMediaViewerLoaded(fileName)
})

Then('the file {string} should not be displayed in the mediaViewer', async function(fileName) {
  const isPresent = await offCanvasPage.isMediaViewerPresent(fileName)
  return assert.ok(!isPresent)
})
