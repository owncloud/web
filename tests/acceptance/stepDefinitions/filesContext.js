const { client } = require('nightwatch-api')
const assert = require('assert')
const { Given, When, Then } = require('cucumber')
let deletedElementsTable = []

When('the user browses to the files page',
  () => {
    return client
      .page.filesPage()
      .navigate()
  })

When('the user browses to the favorites page', function () {
  return client
    .page.favoritesPage()
    .navigate()
})

Given('the user has browsed to the favorites page', function () {
  return client
    .page.favoritesPage()
    .navigate()
})

Then('the files table should be displayed',
  () => {
    return client.page.FilesPageElement.filesList()
      .waitForElementVisible('@filesTable')
  })

Given('the user has browsed to the files page', function () {
  return client
    .page.filesPage()
    .navigate()
})

When('the user creates a folder with the name {string} using the webUI', function (folderName) {
  return client.page.filesPage().createFolder(folderName)
})

When('the user creates a folder with the invalid name {string} using the webUI', function (folderName) {
  return client.page.filesPage().createFolder(folderName, false)
})

Given('the user has opened folder {string}', (folder) => client.page.FilesPageElement.filesList().navigateToFolder(folder))
When('the user opens folder {string} using the webUI', (folder) => client.page.FilesPageElement.filesList().navigateToFolder(folder))

Given('the user has opened the share dialog for folder {string}', function (fileName) {
  return client.page.FilesPageElement.filesList().openSharingDialog(fileName)
})

When('the user enables the setting to view hidden folders on the webUI', function () {
  return client.page.filesPage().showHiddenFiles()
})

When('the user deletes file/folder {string} using the webUI', function (element) {
  return client.page.FilesPageElement.filesList().deleteFile(element)
})

When('the user deletes the following elements using the webUI', function (table) {
  for (const line of table.rows()) {
    client.page.FilesPageElement.filesList().deleteFile(line[0])
    deletedElementsTable.push(line[0])
  }
  return client.page.filesPage()
})

When('the user uploads file {string} using the webUI', function (element) {
  return client.page.filesPage().uploadFile(element)
})

When('the user renames file/folder {string} to {string} using the webUI', function (fromName, toName) {
  return client.page.FilesPageElement.filesList().renameFile(fromName, toName)
})

When('the user renames file/folder {string} to an invalid name {string} using the webUI', function (fromName, toName) {
  return client.page.FilesPageElement.filesList().renameFile(fromName, toName, false)
})

Given('the user has disabled folder filter', () => {
  return client.page.filesPage().toggleFilterFileOrFolder('folder', 'disable')
})

When('the user disables folder filter using the webUI', () => {
  return client.page.filesPage().toggleFilterFileOrFolder('folder', 'disable')
})

When('the user enables folder filter using the webUI', function () {
  return client.page.filesPage().toggleFilterFileOrFolder('folder', 'enable')
})

Given('the user has disabled file filter', () => {
  return client.page.filesPage().toggleFilterFileOrFolder('file', 'disable')
})

When('the user disables file filter using the webUI', () => {
  return client.page.filesPage().toggleFilterFileOrFolder('file', 'disable')
})

When('the user enables file filter using the webUI', function () {
  return client.page.filesPage().toggleFilterFileOrFolder('file', 'enable')
})

Given('the user has marked file/folder {string} as favorite using the webUI', function (path) {
  return client.page.FilesPageElement.filesList().markAsFavorite(path)
})

When('the user marks file/folder {string} as favorite using the webUI', function (path) {
  return client.page.FilesPageElement.filesList().markAsFavorite(path)
})

When('the user unmarks the favorited file/folder {string} using the webUI', function (path) {
  return client.page.FilesPageElement.filesList().unmarkFavorite(path)
})

Then(/there should be no files\/folders listed on the webUI/, function () {
  return client.page.FilesPageElement.filesList().allFileRows(function (result) {
    client.assert.equal(result.value.length, 0)
  })
})

Then('file/folder {string} should be listed on the webUI', function (folder) {
  return client
    .page
    .FilesPageElement.filesList()
    .waitForFileVisible(folder)
})

Then('file/folder {string} should be listed in the favorites page on the webUI', function (folder) {
  client.page.phoenixPage().openCoreMenu()

  return client
    .page
    .FilesPageElement.filesList()
    .waitForFileVisible(folder)
})

Then('file/folder {string} should not be listed on the webUI', function (folder) {
  return client.page.FilesPageElement.filesList().assertElementNotListed(folder)
})

Then('the deleted elements should not be listed on the webUI', function () {
  return assertDeletedElementsAreNotListed()
})

Then('the deleted elements should not be listed on the webUI after a page reload', function () {
  client.refresh()
  return assertDeletedElementsAreNotListed()
})

When('the user reloads the current page of the webUI', function () {
  return client.refresh()
})

Then('these folders/files should not be listed on the webUI', function (entryList) {
  entryList.rows().forEach(entry => {
    client.page.FilesPageElement.filesList().assertElementNotListed(entry)
  })
  return client
})

Then('these files/folders should be listed on the webUI', function (entryList) {
  entryList.rows().forEach(entry => {
    // here each entry is an array with one element,
    // which is the name of the entry from the table
    client.page.FilesPageElement.filesList().waitForFileVisible(entry[0])
  })
  return client
})

Then('file/folder {string} should be marked as favorite on the webUI', function (path) {
  return client.page.FilesPageElement.filesList().isMarkedFavorite(path, (value) => {
    assert.strictEqual(value, true, `${path} expected to be favorite but was not`)
  })
})

Then('file/folder {string} should not be marked as favorite on the webUI', function (path) {
  return client.page.FilesPageElement.filesList().isMarkedFavorite(path, (value) => {
    assert.strictEqual(value, false, `not expected ${path} to be favorite but was`)
  })
})

const assertDeletedElementsAreNotListed = function () {
  for (const element of deletedElementsTable) {
    client.page.FilesPageElement.filesList().assertElementNotListed(element)
  }
  return client
}
