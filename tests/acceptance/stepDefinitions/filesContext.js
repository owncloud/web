const { client } = require('nightwatch-api')
const assert = require('assert')
const { Given, When, Then, Before } = require('cucumber')
const webdav = require('../helpers/webdavHelper')
const loginHelper = require('../helpers/loginHelper')
const { move } = require('../helpers/webdavHelper')
const path = require('path')
let deletedElements
let timeOfLastDeleteOperation = Date.now()
let timeOfLastUploadOperation = Date.now()
const { download } = require('../helpers/webdavHelper')

Before(() => {
  deletedElements = []
})

When('the user browses to the files page',
  () => {
    return client
      .page.filesPage()
      .navigateAndWaitTillLoaded()
  })

When('the user browses to the favorites page', function () {
  return client
    .page.favoritesPage()
    .navigateAndWaitTillLoaded()
})

Given('the user has browsed to the favorites page', function () {
  return client
    .page.favoritesPage()
    .navigateAndWaitTillLoaded()
})

When('the user browses to the shared-with-me page', function () {
  return client
    .page.sharedWithMePage()
    .navigateAndWaitTillLoaded()
})

Given('the user has browsed to the shared-with-me page', function () {
  return client
    .page.sharedWithMePage()
    .navigateAndWaitTillLoaded()
})

Given('the user has browsed to the shared-with-others page', function () {
  return client
    .page.sharedWithOthersPage()
    .navigateAndWaitTillLoaded()
})

When('the user browses to the shared-with-me page using the webUI', function () {
  return client
    .page.phoenixPage()
    .navigateToUsingMenu('Shared with me')
})

When('the user browses to the shared-with-others page', function () {
  return client
    .page.sharedWithOthersPage()
    .navigateAndWaitTillLoaded()
})

When('the user browses to the shared-with-others page using the webUI', function () {
  return client
    .page.phoenixPage()
    .navigateToUsingMenu('Shared with others')
})

Given('the user has browsed to the trashbin page', function () {
  return client
    .page.trashbinPage()
    .navigateAndWaitTillLoaded()
})

When('the user browses to the trashbin page', function () {
  return client
    .page.trashbinPage()
    .navigateAndWaitTillLoaded()
})

Given('the user has browsed to the favorites page using the webUI', function () {
  return client
    .page.phoenixPage()
    .navigateToUsingMenu('Favorites')
})

When('the user browses to the favorites page using the webUI', function () {
  return client
    .page.phoenixPage()
    .navigateToUsingMenu('Favorites')
})

When('the user browses to the files page using the webUI', function () {
  return client
    .page.phoenixPage()
    .navigateToUsingMenu('All files')
})

Then('the files table should be displayed',
  () => {
    return client.page.FilesPageElement.filesList()
      .waitForElementVisible('@filesTable')
  })

Given('the user has browsed to the files page', function () {
  return client
    .page.filesPage()
    .navigateAndWaitTillLoaded()
})
Given('user {string} has uploaded file with content {string} to {string}', async function (user, content, filename) {
  await waitBetweenFileUploadOperations()
  await webdav.uploadFileWithContent(user, content, filename)
})

When('the user browses to display the {string} details of file {string}', function (versions, filename) {
  return client.page.FilesPageElement.filesList().getVersions(filename)
})

Given('user {string} has moved file {string} to {string}', function (user, fromName, toName) {
  return move(user, fromName, toName)
})

When('the user creates a folder with the name {string} using the webUI', function (folderName) {
  return client.page.filesPage().createFolder(folderName)
})

When('the user creates a file with the name {string} using the webUI', function (fileName) {
  return client.page.filesPage().createFile(fileName)
})

When('the user creates a folder with default name using the webUI', function () {
  return client.page.filesPage().createFolder(null, false)
})

When('the user creates a folder without name using the webUI', function () {
  return client.page.filesPage().createFolder('', false)
})

When('the user creates a folder with the invalid name {string} using the webUI', function (folderName) {
  return client.page.filesPage().createFolder(folderName, false)
})

Given('the user has opened folder {string}', (folder) => client.page.FilesPageElement.filesList().navigateToFolder(folder))
When('the user opens folder {string} using the webUI', (folder) => client.page.FilesPageElement.filesList().navigateToFolder(folder))

Given('the user has opened the share dialog for file/folder {string}', function (fileName) {
  return client.page.FilesPageElement.filesList().openSharingDialog(fileName)
})

When('the user enables the setting to view hidden files/folders on the webUI', function () {
  return client.page.filesPage().showHiddenFiles()
})

When('the user deletes file/folder {string} using the webUI', function (element) {
  return client.page.FilesPageElement.filesList().deleteFile(element)
})

Given('the user has deleted file/folder/resource {string} using the webUI', function (element) {
  return client.page.FilesPageElement.filesList().deleteFile(element)
})

When('the user deletes the following elements using the webUI', async function (table) {
  for (const line of table.rows()) {
    await client.page.FilesPageElement.filesList().deleteFile(line[0])
    deletedElements.push(line[0])
  }
  return client.page.filesPage()
})

/**
 * makes sure delete operations are carried out maximum once a second to avoid trashbin issues
 * see https://github.com/owncloud/core/issues/23151
 */
const waitBetweenDeleteOperations = async function () {
  const timeSinceLastDelete = Date.now() - timeOfLastDeleteOperation
  if (timeSinceLastDelete <= 1000) {
    await client.pause(1000 - timeSinceLastDelete + 1)
  }
  timeOfLastDeleteOperation = Date.now()
}

/**
 * makes sure upload operations are carried out maximum once a second to avoid version issues
 * see https://github.com/owncloud/core/issues/23151
 */
const waitBetweenFileUploadOperations = async function () {
  const timeSinceLastFileUpload = Date.now() - timeOfLastUploadOperation
  if (timeSinceLastFileUpload <= 1000) {
    await client.pause(1001 - timeSinceLastFileUpload)
  }
  timeOfLastUploadOperation = Date.now()
}

Given('the following files have been deleted by user {string}', async function (user, table) {
  const filesToDelete = table.hashes()
  for (const entry of filesToDelete) {
    await waitBetweenDeleteOperations()
    await webdav.delete(user, entry.name)
  }
  return client
})

When('the user uploads file {string} using the webUI', function (element) {
  const uploadPath = path.join(client.globals.mountedUploadDir, element)
  return client.page.filesPage().uploadFile(uploadPath)
})

When('the user uploads a created file {string} using the webUI', function (element) {
  const filePath = path.join(client.globals.filesForUpload, element)
  return client.uploadRemote(filePath, function (uploadPath) {
    client.page.filesPage().uploadFile(uploadPath)
  })
})

When('the user uploads folder {string} using the webUI', function (element) {
  const rootUploadDir = client.globals.mountedUploadDir
  const name = path.join(rootUploadDir, element)
  return client.page.filesPage().uploadFolder(name)
})

When('the user uploads a folder containing the following files in separate sub-folders using the webUI:', async function (files) {
  files = files.raw().map(item => item[0])

  if ((new Set(files)).size !== files.length) {
    throw new Error(
      `Allowing upload of multiple files in the same folder would complicate
      other step-definitions. Please remove duplicated files and retry.`
    )
  }

  if (files.length === 1) {
    throw new Error('Please try uploading more than one file. Uploading only one file is not supported.')
  }

  for (const file of files) {
    const filePath = path.join(client.globals.filesForUpload, file)
    await client.uploadRemote(filePath)
  }
  return client.page.filesPage().uploadSessionFolder()
})

Then('it should not be possible to create files using the webUI', function () {
  return client.page.filesPage().canCreateFiles((isDisabled) => {
    client.assert.strictEqual(isDisabled, true, 'Create action must not be enabled')
  })
})

When('the user renames file/folder {string} to {string} using the webUI', function (fromName, toName) {
  return client.page.FilesPageElement.filesList().renameFile(fromName, toName)
})

When('the user renames file/folder {string} to an invalid name {string} using the webUI', function (fromName, toName) {
  return client.page.FilesPageElement.filesList().renameFile(fromName, toName, false)
})

When('the user renames the following file/folder using the webUI', async function (dataTable) {
  for (const { fromName, toName } of dataTable.hashes()) {
    await client
      .page.FilesPageElement.filesList().renameFile(
        fromName,
        toName
      )
  }
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

Then('file/folder with path {string} should be listed in the favorites page on the webUI', function (path) {
  return client
    .page
    .FilesPageElement.filesList()
    .waitForFileWithPathVisible(path)
})

Then('the last uploaded folder should be listed on the webUI', function () {
  const folder = client.sessionId
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

Then('the versions list should contain {int} entries', function (expectedNumber) {
  return client.page.filesPage().assertVersionsPresent(expectedNumber)
})

Then('the content of file {string} for user {string} should be {string}', function (file, user, content) {
  return download(user, file).then(data => assert.strictEqual(content, data))
})

When('the user restores the file to last version using the webUI', function () {
  return client.page.filesPage().restoreToPreviousVersion()
}
)

When('the user reloads the current page of the webUI', function () {
  return client.refresh()
})

Given('the user has reloaded the current page of the webUI', function () {
  return client.refresh()
})

When('the user marks all files for batch action using the webUI', function () {
  return client.page.FilesPageElement.filesList().checkAllFiles()
})

When('the user batch deletes the marked files using the webUI', function () {
  return client.page.filesPage().deleteAllCheckedFiles()
})

When('the user batch deletes these files using the webUI', function (fileOrFolders) {
  fileOrFolders.rows().forEach(entry => {
    client.page.FilesPageElement.filesList().toggleFileOrFolderCheckbox('enable', entry[0])
    deletedElements.push(entry[0])
  })
  return client.page.filesPage().deleteAllCheckedFiles()
})

When('the user unmarks these files for batch action using the webUI', function (fileOrFolders) {
  fileOrFolders.rows().forEach(entry => {
    client.page.FilesPageElement.filesList().toggleFileOrFolderCheckbox('disable', entry[0])
  })
  return client
})

When('the user marks these files for batch action using the webUI', function (fileOrFolders) {
  fileOrFolders.rows().forEach(entry => {
    client.page.FilesPageElement.filesList().toggleFileOrFolderCheckbox('enable', entry[0])
  })
  return client
})

When('the user batch restores the marked files using the webUI', function () {
  return client.page.FilesPageElement.filesList().restoreSelected()
})

When('the user picks the row of file/folder {string} in the webUI', function (item) {
  return client.page.FilesPageElement.filesList().clickRow(item)
})

When('the user switches to {string} tab in details panel using the webUI', function (tab) {
  return client.page.filesPage().selectTabInSidePanel(tab)
})

Then('the folder should be empty on the webUI', async function () {
  const allFileRows = await client.page.FilesPageElement.filesList().allFileRows()
  return client.assert.equal(allFileRows.value.length, 0)
})

const theseResourcesShouldNotBeListed = function (entryList) {
  entryList.rows().forEach(entry => {
    client.page.FilesPageElement.filesList().assertElementNotListed(entry[0])
  })
  return client
}

/**
 * needs a heading line in the table
 */
Then('these folders/files/resources should not be listed on the webUI', function (entryList) {
  return theseResourcesShouldNotBeListed(entryList)
})

/**
 * needs a heading line in the table
 */
Then('as {string} these folders/files/resources should not be listed on the webUI', async function (user, entryList) {
  if (user !== client.globals.currentUser) {
    await loginHelper.reLoginAsUser(user)
  }
  return theseResourcesShouldNotBeListed(entryList)
})

/**
 * currently this only works with the files page, on other pages the user cannot navigate into subfolders
 *
 * needs a heading line in the table
 */
Then('these folders/files/resources should not be listed in the folder {string} on the webUI', function (folder, entryList) {
  client.page.filesPage().navigateAndWaitTillLoaded(folder)
  return theseResourcesShouldNotBeListed(entryList)
})

/**
 * currently this only works with the files page, on other pages the user cannot navigate into subfolders
 *
 * needs a heading line in the table
 */
Then('as {string} these folders/files/resources should not be listed in the folder {string} on the webUI', async function (user, folder, entryList) {
  if (user !== client.globals.currentUser) {
    await loginHelper.reLoginAsUser(user)
  }
  client.page.filesPage().navigateAndWaitTillLoaded(folder)
  return theseResourcesShouldNotBeListed(entryList)
})

/**
 *
 * @param {DataTable} entryList the list needs a heading line
 */
const theseResourcesShouldBeListed = function (entryList) {
  if (entryList.rows().length <= 0) {
    throw Error('Gerkin entry list is empty. Missing heading?')
  }
  entryList.rows().forEach(entry => {
    // here each entry is an array with one element,
    // which is the name of the entry from the table
    client.page.FilesPageElement.filesList().waitForFileVisible(entry[0])
  })
  return client
}

/**
 * needs a heading line in the table
 */
Then('these files/folders/resources should be listed on the webUI', function (entryList) {
  return theseResourcesShouldBeListed(entryList)
})

/**
 * currently this only works with the files page, on other pages the user cannot navigate into subfolders
 *
 * needs a heading line in the table
 */
Then('these files/folders/resources should be listed in the folder {string} on the webUI', function (folder, entryList) {
  client.page.filesPage().navigateAndWaitTillLoaded(folder)
  return theseResourcesShouldBeListed(entryList)
})

/**
 * needs a heading line in the table
 */
Then('as {string} these files/folders/resources should be listed on the webUI', async function (user, entryList) {
  if (user !== client.globals.currentUser) {
    await loginHelper.reLoginAsUser(user)
  }
  return theseResourcesShouldBeListed(entryList)
})

/**
 * currently this only works with the files page, on other pages the user cannot navigate into subfolders
 *
 * needs a heading line in the table
 */
Then('as {string} these files/folders/resources should be listed in the folder {string} on the webUI', async function (user, folder, entryList) {
  if (user !== client.globals.currentUser) {
    await loginHelper.reLoginAsUser(user)
  }
  client.page.filesPage().navigateAndWaitTillLoaded(folder)
  return theseResourcesShouldBeListed(entryList)
})

Then('file/folder {string} should be marked as favorite on the webUI', function (path) {
  return client.page.FilesPageElement.filesList().isMarkedFavorite(path)
    .then(result => {
      assert.strictEqual(result, true, `${path} expected to be favorite but was not`)
    })
})

Then('file/folder {string} should not be marked as favorite on the webUI', function (path) {
  return client.page.FilesPageElement.filesList().isMarkedFavorite(path)
    .then(result => {
      assert.strictEqual(result, false, `not expected ${path} to be favorite but was`)
    })
})

Then(/there should be (\d+) files\/folders listed on the webUI/, async function (noOfItems) {
  const allFileRows = await client.page.FilesPageElement.filesList().allFileRows()
  return client.assert.equal(allFileRows.value.length, noOfItems)
})

Then('the folder should be empty on the webUI after a page reload', async function () {
  await client.refresh()
  const allFileRows = await client.page.FilesPageElement.filesList().allFileRows()
  return client.assert.equal(allFileRows.value.length, 0)
})

Then('the app-sidebar should be visible', function () {
  return client.page.filesPage().isSidebarVisible((value) => {
    assert.strictEqual(value, true, 'side-bar should be visible, but is not')
  })
})

Then('the {string} details panel should be visible', function (panel) {
  return client.page.filesPage().isPanelVisible(panel, (value) => {
    assert.strictEqual(value, true, `'${panel}-panel' should be visible, but is not`)
  })
})

Then('no {string} tab should be available in the details panel', function (tab) {
  const tabSelector = client.page.filesPage().getXpathOfLinkToTabInSidePanel()
  return client.page.filesPage()
    .useXpath()
    .waitForElementNotPresent(tabSelector)
})

const assertElementsAreListed = function (elements) {
  for (const element of elements) {
    client.page.FilesPageElement.filesList().assertElementListed(element)
  }
  return client
}

const assertElementsAreNotListed = function (elements) {
  for (const element of elements) {
    client.page.FilesPageElement.filesList().assertElementNotListed(element)
  }
  return client
}

const assertDeletedElementsAreNotListed = function () {
  return assertElementsAreNotListed(deletedElements)
}

const assertDeletedElementsAreListed = function () {
  return assertElementsAreListed(deletedElements)
}

When('the user restores file/folder {string} from the trashbin using the webUI', function (element) {
  return client.page.FilesPageElement.filesList().restoreFile(element)
})

Then('the following files/folders/resources should be listed on the webUI', function (table) {
  return assertElementsAreListed([].concat.apply([], table.rows()))
})

Then('file/folder {string} should be listed in the folder {string} on the webUI', function (file, folder) {
  return client
    .page
    .FilesPageElement
    .filesList()
    .navigateToFolder(folder)
    .waitForFileVisible(file)
})

Then('the deleted elements should be listed on the webUI', function () {
  return assertDeletedElementsAreListed()
})

Given('the user has renamed the following files', function (table) {
  return Promise.all(table.hashes().map((row) => {
    return webdav.move(client.globals.currentUser, row['from-name-parts'], row['to-name-parts'])
  }))
})

Given('user {string} has renamed file/folder {string} to {string}', webdav.move)

Given('the user has created folder {string}', function (fileName) {
  return webdav.createFolder(client.globals.currentUser, fileName)
})
Given('user {string} has created folder {string}', webdav.createFolder)

Then('file/folder {string} should not be listed in shared-with-others page on the webUI', function (filename) {
  client.page.sharedWithOthersPage().navigateAndWaitTillLoaded()
  return client.page.FilesPageElement.filesList().assertElementNotListed(filename)
})

Then('file/folder {string} should be listed in shared-with-others page on the webUI', function (filename) {
  client.page.sharedWithOthersPage().navigateAndWaitTillLoaded()
  return client.page.FilesPageElement.filesList().waitForFileVisible(filename)
})

Given('the user has created file {string}', function (fileName) {
  return webdav.createFile(client.globals.currentUser, fileName, '')
})
Given('user {string} has created file {string}', function (userId, fileName) {
  return webdav.createFile(userId, fileName, '')
})

Given('the user has created the following folders', function (entryList) {
  entryList.rows().forEach(entry => {
    webdav.createFolder(client.globals.currentUser, entry[0])
  })
  return client
})
Given('the user has created the following files', function (entryList) {
  entryList.rows().forEach(entry => {
    webdav.createFile(client.globals.currentUser, entry[0])
  })
  return client
})

When('the user browses to the folder {string} on the files page', (folderName) => {
  const targetFolder = folderName === '/' ? '' : folderName
  return client
    .page.filesPage()
    .navigateAndWaitTillLoaded(targetFolder)
})
When('the user copies the permalink of the current folder using the webUI', function () {
  return client.page.filesPage().copyPermalinkFromFilesAppBar()
})
Then('the clipboard content should match permalink of resource {string}', async function (folderName) {
  const folderData = await webdav.getProperties(folderName, client.globals.currentUser, ['oc:privatelink'])
  return client.getClipBoardContent(function (value) {
    assert.strictEqual(folderData['oc:privatelink'], value)
  })
})

Then('the app-sidebar for file/folder {string} should be visible on the webUI', resource => {
  return client.page.filesPage()
    .isSidebarVisible(value => {
      assert.strictEqual(value, true, 'sidebar should be visible, but is not')
    })
    .checkSidebarItem(resource)
})

Then('the thumbnail should be visible in the app-sidebar', function () {
  return client.page.FilesPageElement.appSideBar().isThumbnailVisible()
})

When('the user deletes the file {string} from the deleted files list', function (element) {
  return client.page.FilesPageElement.filesList().deleteImmediately(element)
})

Then('it should not be possible to delete file/folder {string} using the webUI', function (resource) {
  return client.page.FilesPageElement
    .filesList()
    .assertActionDisabled('delete', resource)
})

Then('it should not be possible to rename file/folder {string} using the webUI', function (resource) {
  return client.page.FilesPageElement
    .filesList()
    .assertActionDisabled('rename', resource)
})

When('the user uploads overwriting file {string} using the webUI', function (file) {
  const uploadPath = path.join(client.globals.mountedUploadDir, file)
  return client.page.filesPage().selectFileForUpload(uploadPath)
    .then(() => client.page.filesPage().confirmFileOverwrite())
})

When('the user creates a new file {string} using the webUI', function (newFileName) {
  return client.page.filesPage().createNewFile(newFileName)
})

When('the user tries to create a file with already existing name {string} using the webUI', function (fileName) {
  return client.page.filesPage().triesToCreateExistingFile(fileName)
})

Then('an error message {string} should be visible', function (errorMessage) {
  return client.page.filesPage().waitForErrorMessage((exactErrorMessage) => {
    assert.strictEqual(errorMessage, exactErrorMessage)
  })
})

Then('the create file button should be disabled', function () {
  return client.page.filesPage().checkForButtonDisabled()
})

When('user {string} has renamed the following file', function (user, table) {
  const fromName = table.hashes().map(data => data['from-name-parts']).join('')
  const toName = table.hashes().map(data => data['to-name-parts']).join('')
  return webdav.move(user, fromName, toName)
})

Then('the following file should be listed on the webUI', function (table) {
  const name = table.hashes().map(data => data['name-parts']).join('')
  return client.page.FilesPageElement.filesList().assertElementListed(name)
})

Then('the following file should not be listed on the webUI', function (table) {
  const name = table.hashes().map(data => data['name-parts']).join('')
  return client.page.FilesPageElement.filesList().assertElementNotListed(name)
})

Then('the user deletes the following file using the webUI', function (table) {
  const name = table.hashes().map(data => data['name-parts']).join('')
  return client.page.FilesPageElement.filesList().deleteFile(name)
})
