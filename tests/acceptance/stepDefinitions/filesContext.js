const { client } = require('nightwatch-api')
const assert = require('assert')
const { Given, When, Then, Before } = require('cucumber')
const webdav = require('../helpers/webdavHelper')
const _ = require('lodash')
const loginHelper = require('../helpers/loginHelper')
const { move } = require('../helpers/webdavHelper')
const path = require('../helpers/path')
const util = require('util')
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

When('the user opens folder {string} directly on the webUI', function (folder) {
  folder = encodeURIComponent(path.normalize(folder))
  return client.page.filesPage().navigateAndWaitTillLoaded(folder)
})

Given('user {string} has uploaded file with content {string} to {string}', async function (user, content, filename) {
  await waitBetweenFileUploadOperations()
  await webdav.uploadFileWithContent(user, content, filename)
})

When('the user browses to display the {string} details of file {string}', async function (versions, filename) {
  const api = client.page.FilesPageElement
  await api
    .filesList()
    .clickRow(filename)
  api.appSideBar()
    .openVersionsTab()
  return client
})

Given('user {string} has moved file/folder {string} to {string}', function (user, fromName, toName) {
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

Given('the user has opened the share dialog for file/folder {string}', async function (fileName) {
  await client.page.FilesPageElement.filesList().openSharingDialog(fileName)

  return client
})

When('the user browses to folder {string} using the breadcrumb on the webUI', (resource) =>
  client.page.filesPage().navigateToBreadcrumb(resource))

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
  return client
})

Then('there should be no breadcrumb displayed on the webUI', function () {
  return assertBreadCrumbIsNotDisplayed()
})

Then('breadcrumb for folder {string} should be displayed on the webUI', function (resource) {
  return assertBreadcrumbIsDisplayedFor(resource)
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

Given('the following files/folders/resources have been deleted by user {string}', async function (user, table) {
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

When('the public uploads file {string} in files-drop page', function (element) {
  const rootUploadDir = client.globals.mountedUploadDir
  const filePath = path.join(rootUploadDir, element)
  return client.page.filesDropPage()
    .initAjaxCounters()
    .uploadFile(filePath)
    .waitForOutstandingAjaxCalls()
})

Then('the following files should be listed on the files-drop page:', async function (filesToCheck) {
  filesToCheck = filesToCheck.raw().map(([file]) => file)

  const actualFiles = await client.page.filesDropPage().getUploadedFiles()
  const filesNotUploaded = _.difference(filesToCheck, actualFiles)
  assert.strictEqual(
    filesNotUploaded.length,
    0,
    'Could not find following files: \n' + filesNotUploaded
  )
})

When('the user unshares file/folder {string} using the webUI', function (element) {
  return client.page.FilesPageElement.filesList().deleteFile(element)
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
  return client
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

Then('there should be no files/folders/resources listed on the webUI', async function () {
  let currentUrl = null
  await client.url((result) => {
    currentUrl = result.value
  })

  // only check empty message in regular file lists, not files drop page
  if (currentUrl.indexOf('/files-drop/') === -1) {
    const noContentMessageVisible = await client
      .page
      .FilesPageElement.filesList()
      .isNoContentMessageVisible()
    assert.ok(noContentMessageVisible, 'Empty message must be visible')
  }

  const allRowsResult = await client.page.FilesPageElement.filesList().allFileRows()

  assert.ok(allRowsResult.value.length === 0, `No resources are listed, ${allRowsResult.length} found`)
})

Then('file {string} should be listed on the webUI', function (folder) {
  return client
    .page
    .FilesPageElement.filesList()
    .waitForFileVisible(folder, 'file')
})

Then('folder {string} should be listed on the webUI', (folder) => {
  return client
    .page
    .FilesPageElement.filesList()
    .waitForFileVisible(folder, 'folder')
})

Then('file/folder with path {string} should be listed in the favorites page on the webUI', function (path) {
  return client
    .page
    .FilesPageElement.filesList()
    .waitForFileWithPathVisible(path)
})

Then('the last uploaded folder should be listed on the webUI', async function () {
  const folder = client.sessionId
  await client
    .page
    .FilesPageElement.filesList()
    .waitForFileVisible(folder)

  return client
})

Then('file {string} should not be listed on the webUI', async function (folder) {
  const state = await client.page.FilesPageElement.filesList().isElementListed(folder, 'file')
  return client.assert.ok(
    !state, `Error: Resource ${folder} is listed on the filesList`
  )
})

Then('folder {string} should not be listed on the webUI', async (folder) => {
  const state = await client.page.FilesPageElement.filesList().isElementListed(folder, 'folder')
  return client.assert.ok(
    !state, `Error: Resource ${folder} is listed on the filesList`
  )
})

Then('the deleted elements should not be listed on the webUI', function () {
  return assertDeletedElementsAreNotListed()
})

Then('the deleted elements should not be listed on the webUI after a page reload', function () {
  client.refresh()
  return assertDeletedElementsAreNotListed()
})

Then('the versions list should contain {int} entries', async function (expectedNumber) {
  const count = await client.page.FilesPageElement.versionsDialog().getVersionsCount()
  return assert.strictEqual(
    expectedNumber, count
  )
})

Then('the versions list for resource {string} should contain {int} entry/entries', async function (resourceName, expectedNumber) {
  const api = client.page.FilesPageElement
  await api
    .filesList()
    .clickRow(resourceName)
  api.appSideBar()
    .openVersionsTab()
  const count = await api.versionsDialog().getVersionsCount()

  assert.strictEqual(
    expectedNumber, count
  )

  client.page.FilesPageElement.appSideBar().closeSidebar(100)

  return this
})

Then('the content of file {string} for user {string} should be {string}', async function (file, user, content) {
  const remote = await download(user, file)
  return client.assert.strictEqual(
    remote, content,
    `Failed asserting remote file ${file} is same as content ${content} for user${user}`
  )
})

When('the user restores the file to last version using the webUI', function () {
  return client.page.FilesPageElement.versionsDialog().restoreToPreviousVersion()
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

When('the user batch deletes these files using the webUI', async function (fileOrFolders) {
  for (const item of fileOrFolders.rows()) {
    await client.page.FilesPageElement.filesList().toggleFileOrFolderCheckbox('enable', item[0])
    deletedElements.push(item[0])
  }

  return client.page.filesPage().deleteAllCheckedFiles()
})

When('the user unmarks these files for batch action using the webUI', async function (fileOrFolders) {
  for (const item of fileOrFolders.rows()) {
    await client.page.FilesPageElement.filesList().toggleFileOrFolderCheckbox('disable', item[0])
  }
})

When('the user marks these files for batch action using the webUI', async function (fileOrFolders) {
  for (const item of fileOrFolders.rows()) {
    await client.page.FilesPageElement.filesList().toggleFileOrFolderCheckbox('enable', item[0])
  }
})

When('the user clears the trashbin', function () {
  return client.page.trashbinPage().clearTrashbin()
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

Then('the trashbin should be empty on the webUI', async function () {
  const allFileRows = await client.page.FilesPageElement.filesList().allFileRows()
  return client.assert.strictEqual(allFileRows.value.length, 0)
})

const theseResourcesShouldNotBeListed = async function (table) {
  for (const entry of table.rows()) {
    const state = await client.page.FilesPageElement.filesList().isElementListed(entry[0])
    assert.ok(!state, `Expected resource '${entry[0]}' to be 'not present' but found 'present'`)
  }
}

/**
 * needs a heading line in the table
 */
Then('these folders/files/resources should not be listed on the webUI', function (table) {
  return theseResourcesShouldNotBeListed(table)
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
const theseResourcesShouldBeListed = async function (entryList) {
  if (entryList.rows().length <= 0) {
    throw Error('Gerkin entry list is empty. Missing heading?')
  }

  for (const item of entryList.rows()) {
    await client.page.FilesPageElement.filesList().waitForFileVisible(item[0])
  }

  return client
}

const assertBreadCrumbIsNotDisplayed = function () {
  const breadcrumbXpath = client.page.filesPage().elements.breadcrumb.selector
  return client.expect.element(breadcrumbXpath).to.not.be.present
}

/**
 *
 * @param {string} resource
 */
const assertBreadcrumbIsDisplayedFor = function (resource) {
  const breadcrumbElement = client.page.filesPage().elements.resourceBreadcrumb
  const resourceBreadcrumbXpath = util.format(breadcrumbElement.selector, resource)
  return client
    .useStrategy(breadcrumbElement)
    .assert
    .visible(resourceBreadcrumbXpath,
      `Resource ${resourceBreadcrumbXpath} expected to be visible but is not visible .`)
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
  const itemsCount = await client.page.FilesPageElement.filesList().countFilesAndFolders()
  return client.assert.equal(itemsCount, noOfItems)
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

Then('the following tabs should be visible in the details dialog', async function (table) {
  const visibleTabs = await client.page.filesPage().getVisibleTabs()
  const expectedVisibleTabs = table.rows()
  const difference = _.difference(expectedVisibleTabs.flat(), visibleTabs)
  if (difference.length !== 0) {
    throw new Error(`${difference} tabs was expected to be visible but not found.`)
  }
})

Then('no {string} tab should be available in the details panel', function (tab) {
  const tabSelector = client.page.filesPage().getXpathOfLinkToTabInSidePanel()
  return client.page.filesPage()
    .useXpath()
    .waitForElementNotPresent(tabSelector)
})

const assertElementsAreListed = async function (elements) {
  for (const element of elements) {
    const state = await client.page.FilesPageElement.filesList().isElementListed(element)
    assert.ok(
      state, `Expected resource '${element}' to be 'present' but found 'not present'`
    )
  }
  return client
}

const assertElementsAreNotListed = async function (elements) {
  for (const element of elements) {
    const state = await client.page.FilesPageElement.filesList().isElementListed(element)
    assert.ok(
      !state, `Expected resource '${element}' to be 'not present' but found 'present'`
    )
  }
  return client
}

const assertDeletedElementsAreNotListed = function () {
  return assertElementsAreNotListed(deletedElements)
}

const assertDeletedElementsAreListed = function () {
  return assertElementsAreListed(deletedElements)
}

When(/^the user restores (file|folder) "([^"]*)" from the trashbin using the webUI$/, function (elementType, element) {
  return client.page.FilesPageElement.filesList().restoreFile(element, elementType)
})

Then('the following files/folders/resources should be listed on the webUI', function (table) {
  return assertElementsAreListed([].concat.apply([], table.rows()))
})

Then('file/folder {string} should be listed in the folder {string} on the webUI', async function (file, folder) {
  const api = client
    .page
    .FilesPageElement
    .filesList()

  await api.navigateToFolder(folder)

  await api.waitForFileVisible(file)

  return client
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

Then('file/folder {string} should not be listed in shared-with-others page on the webUI', async function (filename) {
  client.page.sharedWithOthersPage().navigateAndWaitTillLoaded()
  const state = await client.page.FilesPageElement.filesList().isElementListed(filename)
  assert.ok(
    !state, `Error: Resource ${filename} is present on the shared-with-others page on the webUI`
  )
})

Then('file/folder {string} should be listed in shared-with-others page on the webUI', async function (filename) {
  await client.page.sharedWithOthersPage().navigateAndWaitTillLoaded()
  await client.page.FilesPageElement.filesList().waitForFileVisible(filename)

  return client
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
When('the user copies the permalink of the file/folder/resource {string} using the webUI', async function (file) {
  await client.page.FilesPageElement.filesList().openSharingDialog(file, 'links')
  await client.page.filesPage().copyPermalinkFromFilesAppBar()
  return client
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

Then('it should not be possible to delete file/folder {string} using the webUI', async function (resource) {
  const state = await client.page.FilesPageElement
    .filesList()
    .isActionAttributeDisabled('delete', resource)
  assert.ok(state, `expected property disabled of ${resource} to be 'true' but found ${state}`)
})

Then('it should not be possible to rename file/folder {string} using the webUI', async function (resource) {
  const state = await client.page.FilesPageElement
    .filesList()
    .isActionAttributeDisabled('rename', resource)
  assert.ok(state, `expected property disabled of ${resource} to be 'true' but found ${state}`)
})

When('the user uploads overwriting file {string} using the webUI', function (file) {
  const uploadPath = path.join(client.globals.mountedUploadDir, file)
  return client.page.filesPage().selectFileForUpload(uploadPath)
    .then(() => client.page.filesPage().confirmFileOverwrite())
})

When('the user tries to create a file with already existing name {string} using the webUI', function (fileName) {
  return client.page.filesPage().triesToCreateExistingFile(fileName)
})

Then('the create file button should be disabled', function () {
  return client.page.filesPage().checkForButtonDisabled()
})

When('user {string} has renamed the following file', function (user, table) {
  const fromName = table.hashes().map(data => data['from-name-parts']).join('')
  const toName = table.hashes().map(data => data['to-name-parts']).join('')
  return webdav.move(user, fromName, toName)
})

Then('the following file should be listed on the webUI', async function (table) {
  const name = table.hashes().map(data => data['name-parts']).join('')
  const state = await client.page.FilesPageElement.filesList().isElementListed(name)
  return assert.strictEqual(
    state, true, `Element ${name} is not present on the filesList!`
  )
})

Then('the following file should not be listed on the webUI', async function (table) {
  const name = table.hashes().map(data => data['name-parts']).join('')
  const state = await client.page.FilesPageElement.filesList().isElementListed(name)
  return assert.ok(
    !state, `Element ${name} is present on the filesList!`
  )
})

Then('the user deletes the following file using the webUI', function (table) {
  const name = table.hashes().map(data => data['name-parts']).join('')
  return client.page.FilesPageElement.filesList().deleteFile(name)
})

Then('the user should be redirected to the files-drop page', function () {
  return client.page.filesDropPage().waitForPage()
})

Then('the user should be redirected to the public links page', function () {
  return client.page.publicLinkFilesPage().waitForPage()
})

Then('file/folder {string} shared by {string} should not be listed in the webUI', async function (element, sharer) {
  const found = await client.page.sharedWithMePage().isSharePresent(element, sharer)
  assert.ok(!found, element + ' shared by ' + sharer + ' was present but was not expected to be present')
})

Then('the page should be empty', async function () {
  const isVisible = await client.page.phoenixPage().isPageVisible()
  assert.ok(!isVisible, 'The phoenix page should be empty but is not')
})

When('the user downloads file/folder {string} using the webUI', function (file) {
  return client.page.FilesPageElement.filesList().downloadFile(file)
})

Then('the following resources should have share indicators on the webUI', async function (dataTable) {
  for (const { fileName, expectedIndicators } of dataTable.hashes()) {
    const indicatorsArray = await client
      .page.FilesPageElement.filesList().getShareIndicatorsForResource(fileName)

    const expectedIndicatorsArray = expectedIndicators.split(',').map(s => s.trim())
    assert.ok(
      _.intersection(indicatorsArray, expectedIndicatorsArray).length === expectedIndicatorsArray.length,
      `Expected share indicators to be the same for "${fileName}": expected [` + expectedIndicatorsArray.join(', ') + '] got [' + indicatorsArray.join(', ') + ']'
    )
  }
})

Then('the following resources should not have share indicators on the webUI', async function (dataTable) {
  for (const [fileName] of dataTable.raw()) {
    const indicatorsArray = await client
      .page.FilesPageElement.filesList().getShareIndicatorsForResource(fileName)

    assert.ok(!indicatorsArray.length, `Expected no share indicators present for "${fileName}"`)
  }
})

async function _setFilesTableSort (column, isDesc) {
  await client.page.FilesPageElement.filesList().setSort(column, isDesc)
}

When('the user has set the sort order of the {string} column to descending order', async function (column) {
  await _setFilesTableSort(column, true)
})
When('the user has set the sort order of the {string} column to ascending order', async function (column) {
  await _setFilesTableSort(column, false)
})
