const { client } = require('nightwatch-api')
const { When, Then } = require('cucumber')
const offCanvasPage = client.page.FilesPageElement.offCanvasPage()
const filesList = client.page.FilesPageElement.filesList()

When('the user/public views the file {string} in the mediaviewer using the webUI', async function(
  fileName
) {
  await filesList.clickOnFileName(fileName)
  return offCanvasPage.openMediaViewer()
})

Then('the file {string} should be displayed in the mediaViewer', function(fileName) {
  return offCanvasPage.waitForMediaViewerLoaded(fileName)
})
