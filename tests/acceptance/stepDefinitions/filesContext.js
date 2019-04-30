const { client } = require('nightwatch-api')
const { Given, When, Then } = require('cucumber')
let deletedElementsTable = []

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
  return client.page.filesPage().createFolder(folderName)
})

When('the user creates a folder with the invalid name {string} using the webUI', function (folderName) {
  return client.page.filesPage().createFolder(folderName, false)
})

Given('the user has opened folder {string}', (folder) => client.page.filesPage().navigateToFolder(folder))
When('the user opens folder {string} using the webUI', (folder) => client.page.filesPage().navigateToFolder(folder))

When('the user enables the setting to view hidden folders on the webUI', function () {
  return client.page.filesPage().showHiddenFiles()
})

When('the user deletes file/folder {string} using the webUI', function (element) {
  return client.page.filesPage().deleteFile(element)
})

When('the user deletes the following elements using the webUI', function (table) {
  for (const line of table.rows()) {
    client.page.filesPage().deleteFile(line[0])
    deletedElementsTable.push(line[0])
  }
  return client.page.filesPage()
})

When('the user uploads file {string} using the webUI', function (element) {
  return client.page.filesPage().uploadFile(element)
})

When('the user renames file/folder {string} to {string} using the webUI', function (fromName, toName) {
  return client.page.filesPage().renameFile(fromName, toName)
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

Then(/there should be no files\/folders listed on the webUI/, function () {
  return client.page.filesPage().allFileRows(function (result) {
    client.assert.equal(result.value.length, 0)
  })
})

Then('file/folder {string} should be listed on the webUI', function (folder) {
  return client
    .page
    .filesPage()
    .waitForFileVisible(folder)
})

Then('file/folder {string} should not be listed on the webUI', function (folder) {
  return client.page.filesPage().assertElementNotListed(folder)
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
    client.page.filesPage().assertElementNotListed(entry)
  })
  return client
})

Then('these files/folders should be listed on the webUI', function (entryList) {
  entryList.rows().forEach(entry => {
    // here each entry is an array with one element,
    // which is the name of the entry from the table
    client.page.filesPage().waitForFileVisible(entry[0])
  })
  return client
})

const assertDeletedElementsAreNotListed = function () {
  for (const element of deletedElementsTable) {
    client.page.filesPage().assertElementNotListed(element)
  }
  return client
}
