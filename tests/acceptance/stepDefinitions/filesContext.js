const { client } = require('nightwatch-api')
const { Given, When, Then } = require('cucumber')

When('the user browses to the files page',
  () => {
    return client
      .page.filesPage()
      .navigate()
  })

Then('the files table should be displayed',
  () => {
    const filesPage = client.page.filesPage()
    return filesPage
      .waitForElementVisible('@filesTable')
  })

Given('the user has browsed to the files page', function () {
  return client
    .page.filesPage()
    .navigate()
})

When('the user creates a folder with the name {string} using the webUI', function (folderName) {
  const filesPage = client.page.filesPage()
  filesPage
    .waitForElementVisible('@newFileMenuButton', 500000)
    .click('@newFileMenuButton')
    .waitForElementVisible('@newFolderButton')
    .click('@newFolderButton')
    .waitForElementVisible('@newFolderInput')
    .setValue('@newFolderInput', folderName)
    .click('@newFolderOkButton')

  return filesPage.waitForFileVisible(folderName)
})

When('the user opens folder {string} using the webUI', function (folder) {
  return client.page.filesPage().navigateToFolder(folder)
})

Then(/there should be no files\/folders listed on the webUI/, function () {
  return client.page.filesPage().allFileRows(function (result) {
    client.assert.equal(result.value.length, 0)
  })
})

Then('folder {string} should be listed on the webUI', function (folder) {
  return client
    .page
    .filesPage()
    .waitForFileVisible(folder)
})

When('the user reloads the current page of the webUI', function () {
  return client.refresh()
})
