const { client } = require('nightwatch-api')
const { Given, When, Then } = require('@cucumber/cucumber')
const previewPage = client.page.FilesPageElement.previewPage()
const filesList = client.page.FilesPageElement.filesList()
const assert = require('assert')

Given(
  'the user has viewed the file {string} in the preview app using the webUI',
  async function (fileName) {
    await previewPage.openPreview(fileName)
    return previewPage.waitForPreviewLoaded(fileName)
  }
)

When(
  'the user/public views the file {string} in the preview app using the webUI',
  async function (fileName) {
    await previewPage.openPreview(fileName)
    return previewPage.waitForPreviewLoaded(fileName)
  }
)

When(
  'the user/public views the single share file {string} in the preview app using the webUI',
  async function (fileName) {
    await previewPage.openPreviewFromDetailsView(fileName)
    return previewPage.waitForPreviewLoaded(fileName)
  }
)

When('the user navigates to the next media resource using the webUI', function () {
  return previewPage.nextMediaResource()
})

When('the user navigates to the previous media resource using the webUI', function () {
  return previewPage.previousMediaResource()
})

When('the user closes the media resource using the webUI', function () {
  return previewPage.closeMediaResource()
})

When('the user downloads the media resource using the webUI', function () {
  return previewPage.downloadMediaResource()
})

Then('the file {string} should be displayed in the preview app webUI', function (fileName) {
  return previewPage.waitForPreviewLoaded(fileName)
})

Then(
  'the file {string} should not be displayed in the preview app webUI',
  async function (fileName) {
    const isPresent = await previewPage.isPreviewPresent(fileName)
    return assert.ok(!isPresent)
  }
)

When(
  'the user views the file {string} in the preview app by clicking on the file name using the webUI',
  function (fileName) {
    return filesList.clickOnFileName(fileName)
  }
)
