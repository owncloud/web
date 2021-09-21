/* eslint-disable no-unused-expressions */
const { client } = require('nightwatch-api')
const assert = require('assert')
const { Given, When, Then, Before } = require('@cucumber/cucumber')
const webdav = require('../helpers/webdavHelper')
const _ = require('lodash')
const loginHelper = require('../helpers/loginHelper')
const xpathHelper = require('../helpers/xpath')
const backendHelper = require('../helpers/backendHelper')
const { move } = require('../helpers/webdavHelper')
const path = require('../helpers/path')
const util = require('util')
const { download } = require('../helpers/webdavHelper')
const fs = require('fs')
const sharingHelper = require('../helpers/sharingHelper')
const { SHARE_STATE } = require('../helpers/sharingHelper')
const appSideBar = client.page.FilesPageElement.appSideBar()

let deletedElements
let unsharedElements
Before(() => {
  deletedElements = []
  unsharedElements = []
})

When('the user browses to the files page', () => {
  return client.page.personalPage().navigateAndWaitTillLoaded()
})

When('the user browses to the favorites page', function() {
  return client.page.favoritesPage().navigateAndWaitTillLoaded()
})

Given('the user has browsed to the favorites page', function() {
  return client.page.favoritesPage().navigateAndWaitTillLoaded()
})

When('the user browses to the shared-with-me page', function() {
  return client.page.sharedWithMePage().navigateAndWaitTillLoaded()
})

When('the user browses to the shared-with-me page in accepted shares view', function() {
  return client.page.sharedWithMePage().navigateToAcceptedAndWaitUntilLoaded()
})

When('the user browses to the shared-with-me page in declined shares view', function() {
  return client.page.sharedWithMePage().navigateToDeclinedAndWaitUntilLoaded()
})

Given('the user has browsed to the shared-with-me page', function() {
  return client.page.sharedWithMePage().navigateAndWaitTillLoaded()
})

Given('the user has browsed to the shared-with-others page', function() {
  return client.page.sharedWithOthersPage().navigateAndWaitTillLoaded()
})

Given('the user has browsed to the shared-via-link page', function() {
  return client.page.sharedViaLinkPage().navigateAndWaitTillLoaded()
})

When('the user browses to the shared-with-others page', function() {
  return client.page.sharedWithOthersPage().navigateAndWaitTillLoaded()
})

When('the user browses to the shared-with-others page using the webUI', function() {
  return client.page.webPage().navigateToUsingMenu('Shared with others')
})

When('the user browses to the shared-via-link page using the webUI', function() {
  return client.page.webPage().navigateToUsingMenu('Shared via link')
})

Given('the user has browsed to the trashbin page', function() {
  return client.page.trashbinPage().navigateAndWaitTillLoaded()
})

When('the user browses to the trashbin page', function() {
  return client.page.trashbinPage().navigateAndWaitTillLoaded()
})

Given('the user has browsed to the favorites page using the webUI', function() {
  return client.page.webPage().navigateToUsingMenu('Favorites')
})

When('the user browses to the favorites page using the webUI', function() {
  return client.page.webPage().navigateToUsingMenu('Favorites')
})

When('the user browses to the files page using the webUI', function() {
  return client.page.webPage().navigateToUsingMenu('All files')
})

Then('the files table should be displayed', () => {
  return client.page.FilesPageElement.filesList().waitForElementVisible('@anyAfterLoading')
})

Given('the user has browsed to the files page', function() {
  return client.page.personalPage().navigateToBreadcrumb('All files')
})

When('the user opens folder {string} directly on the webUI', async function(folder) {
  folder = encodeURIComponent(path.normalize(folder))
  await client.page.personalPage().navigateAndWaitTillLoaded(folder)
})

Given('user {string} has uploaded file with content {string} to {string}', async function(
  user,
  content,
  filename
) {
  await webdav.createFile(user, filename, content)
  return this
})

Given('user {string} has uploaded file {string} to {string}', async function(
  user,
  source,
  filename
) {
  const filePath = path.join(client.globals.filesForUpload, source)
  const content = fs.readFileSync(filePath)
  await webdav.createFile(user, filename, content)
})

Given('user {string} has uploaded file {string} to {string} on remote server', function(
  user,
  source,
  filename
) {
  return backendHelper.runOnRemoteBackend(async function() {
    const filePath = path.join(client.globals.filesForUpload, source)
    const content = fs.readFileSync(filePath)
    await webdav.createFile(user, filename, content)
  })
})

When('the user browses to display the {string} details of file {string}', async function(
  accordionItem,
  filename
) {
  const api = client.page.FilesPageElement
  await client.initAjaxCounters()
  await api.filesList().openSideBar(filename)
  await api.appSideBar().activatePanel(accordionItem)
  await client.waitForOutstandingAjaxCalls()

  return client
})

Given('user {string} has moved file/folder {string} to {string}', function(user, fromName, toName) {
  return move(user, fromName, toName)
})

When('the user/public creates a folder with the name {string} using the webUI', function(
  folderName
) {
  return client.page.personalPage().createFolder(folderName)
})

When('the user creates a file with the name {string} using the webUI', function(fileName) {
  return client.page.personalPage().createFile(fileName)
})

When('the user creates a folder with default name using the webUI', function() {
  return client.page.personalPage().createFolder(null)
})

When('the user tries to create a folder with the invalid name {string} using the webUI', function(
  folderName
) {
  return client.page.personalPage().createFolder(folderName, false)
})

Given('the user has opened folder {string}', folder =>
  client.page.FilesPageElement.filesList().navigateToFolder(folder)
)
When('the user opens folder {string} using the webUI', folder =>
  client.page.FilesPageElement.filesList().navigateToFolder(folder)
)

Given('the user has opened the share dialog for file/folder {string}', function(fileName) {
  return client.page.FilesPageElement.filesList().openSharingDialog(fileName)
})

When('the user closes the app-sidebar using the webUI', async function() {
  return await client.page.FilesPageElement.appSideBar().closeSidebarIfOpen()
})

When('the user browses to folder {string} using the breadcrumb on the webUI', resource =>
  client.page.personalPage().navigateToBreadcrumb(resource)
)

When('the user deletes file/folder {string} using the webUI', function(element) {
  return client.page.FilesPageElement.filesList().deleteFile(element)
})

When('the user tries to delete file/folder {string} using the webUI', function(element) {
  return client.page.FilesPageElement.filesList().deleteFile(element)
})

Given('the user has deleted file/folder/resource {string} using the webUI', function(element) {
  return client.page.FilesPageElement.filesList().deleteFile(element)
})

When('the user deletes the following elements using the webUI', async function(table) {
  for (const line of table.rows()) {
    await client.page.FilesPageElement.filesList().deleteFile(line[0])
    deletedElements.push(line[0])
  }
  return client.page.personalPage()
})

Then('there should be no breadcrumb displayed on the webUI', function() {
  return assertBreadCrumbIsNotDisplayed()
})

Then('non-clickable breadcrumb for folder {string} should be displayed on the webUI', function(
  resource
) {
  return assertBreadcrumbIsDisplayedFor(resource, false, true)
})

Then('clickable breadcrumb for folder {string} should be displayed on the webUI', function(
  resource
) {
  return assertBreadcrumbIsDisplayedFor(resource, true, false)
})

Then('breadcrumb for folder {string} should be displayed on the webUI', function(resource) {
  return assertBreadcrumbIsDisplayedFor(resource, true, true)
})

Given('the following files/folders/resources have been deleted by user {string}', async function(
  user,
  table
) {
  const filesToDelete = table.hashes()
  for (const entry of filesToDelete) {
    await webdav.delete(user, entry.name)
  }
  return client
})

When('the user/public uploads file {string} using the webUI', function(element) {
  const uploadPath = path.join(client.globals.mountedUploadDir, element)
  return client.page.personalPage().uploadFile(uploadPath)
})

When('the user uploads a created file {string} using the webUI', function(element) {
  const filePath = path.join(client.globals.filesForUpload, element)
  return client.uploadRemote(filePath, function(uploadPath) {
    client.page.personalPage().uploadFile(uploadPath)
  })
})

When('the user uploads a created file {string} with overwrite using the webUI', function(element) {
  const filePath = path.join(client.globals.filesForUpload, element)
  return client.uploadRemote(filePath, function(uploadPath) {
    client.page
      .personalPage()
      .selectFileForUpload(uploadPath)
      .then(() => client.page.personalPage().confirmFileOverwrite())
  })
})

When('the public uploads file/folder {string} in files-drop page', function(element) {
  const rootUploadDir = client.globals.mountedUploadDir
  const filePath = path.join(rootUploadDir, element)
  return client.page
    .filesDropPage()
    .initAjaxCounters()
    .uploadFile(filePath)
    .waitForOutstandingAjaxCalls()
})

Then('the following files should be listed on the files-drop page:', async function(filesToCheck) {
  filesToCheck = filesToCheck.raw().map(([file]) => file)

  const actualFiles = await client.page.filesDropPage().getUploadedFiles()
  const filesNotUploaded = _.difference(filesToCheck, actualFiles)
  assert.strictEqual(
    filesNotUploaded.length,
    0,
    'Could not find following files: \n' + filesNotUploaded
  )
})

When('the user unshares file/folder {string} using the webUI', function(element) {
  return client.page.FilesPageElement.filesList().declineShare(element)
})

When('the user uploads folder {string} using the webUI', function(element) {
  const rootUploadDir = client.globals.mountedUploadDir
  const name = path.join(rootUploadDir, element)
  return client.page.personalPage().uploadFolder(name)
})

When(
  'the user uploads a folder containing the following files in separate sub-folders using the webUI:',
  async function(files) {
    files = files.raw().map(item => item[0])

    if (new Set(files).size !== files.length) {
      throw new Error(
        `Allowing upload of multiple files in the same folder would complicate
      other step-definitions. Please remove duplicated files and retry.`
      )
    }

    if (files.length === 1) {
      throw new Error(
        'Please try uploading more than one file. Uploading only one file is not supported.'
      )
    }

    for (const file of files) {
      const filePath = path.join(client.globals.filesForUpload, file)
      await client.uploadRemote(filePath)
    }
    return client.page.personalPage().uploadSessionFolder()
  }
)

Then('it should not be possible to create files using the webUI', async function() {
  const canCreate = await client.page.personalPage().canCreateFiles()
  await assert.strictEqual(canCreate, true, 'Create action must not be enabled')
})

Then('it should be possible to create files using the webUI', async function() {
  const canCreate = await client.page.personalPage().canCreateFiles()
  await assert.strictEqual(canCreate, false, 'Create action must be enabled')
})

When('the user renames file/folder {string} to {string} using the webUI', function(
  fromName,
  toName
) {
  return client.page.FilesPageElement.filesList().renameFile(fromName, toName)
})

Given('the user has renamed file/folder {string} to {string}', function(fromName, toName) {
  return client.page.FilesPageElement.filesList().renameFile(fromName, toName)
})

When('the user tries to rename file/folder {string} to {string} using the webUI', function(
  fromName,
  toName
) {
  return client.page.FilesPageElement.filesList().renameFile(fromName, toName, false)
})

When('the user renames the following file/folder using the webUI', async function(dataTable) {
  for (const { fromName, toName } of dataTable.hashes()) {
    await client.page.FilesPageElement.filesList().renameFile(fromName, toName)
  }
  return client
})

Given('the user has marked file/folder {string} as favorite using the webUI', function(path) {
  return client.page.FilesPageElement.filesList().markFavorite(path)
})

When('the user marks file/folder {string} as favorite using the webUI', function(path) {
  return client.page.FilesPageElement.filesList().markFavorite(path)
})

When('the user unmarks the favorited file/folder {string} using the webUI', function(path) {
  return client.page.FilesPageElement.filesList().unmarkFavorite(path)
})

When('the user marks file/folder {string} as favorite using the webUI sidebar', async function(
  path
) {
  const api = client.page.FilesPageElement
  await api.filesList().openSideBar(path)
  api.appSideBar().markFavoriteSidebar()
  return client
})

When('the user unmarks the favorited file/folder {string} using the webUI sidebar', async function(
  path
) {
  const api = client.page.FilesPageElement
  await api.filesList().openSideBar(path)
  api.appSideBar().unmarkFavoriteSidebar()
  return client
})

Then('there should be no files/folders/resources listed on the webUI', assertNoResourcesListed)
Then(
  'there should be no files/folders/resources listed on the webUI after a page reload',
  async function() {
    await client.refresh()
    return assertNoResourcesListed()
  }
)

async function assertNoResourcesListed() {
  let currentUrl = null
  await client.url(result => {
    currentUrl = result.value
  })

  // only check empty message in regular file lists, not files drop page
  if (currentUrl.indexOf('/files-drop/') === -1) {
    await client.page.FilesPageElement.filesList().waitForNoContentMessageVisible()
    return
  }

  const allRowsResult = await client.page.FilesPageElement.filesList().allFileRows()
  return assert.ok(
    allRowsResult.value.length === 0,
    `No resources are listed, ${allRowsResult.length} found`
  )
}

Then('there should be a not found error page displayed on the webUI', async function() {
  return await client.page.FilesPageElement.filesList().waitForNotFoundMessageVisible()
})

Then('file {string} should be listed on the webUI', file => {
  return client.page.FilesPageElement.filesList().waitForFileVisible(file, 'file')
})

Then('folder {string} should be listed on the webUI', folder => {
  return client.page.FilesPageElement.filesList().waitForFileVisible(folder, 'folder')
})

Then('file/folder with path {string} should be listed on the webUI', function(path) {
  return client.page.FilesPageElement.filesList().waitForFileVisible(path)
})

Then('the last uploaded folder should be listed on the webUI', async function() {
  const folder = client.sessionId
  await client.page.FilesPageElement.filesList().waitForFileVisible(folder)

  return client
})

Then('file {string} should not be listed on the webUI', function(file) {
  return client.page.FilesPageElement.filesList()
    .isElementListed(file, 'file', client.globals.waitForNegativeConditionTimeout)
    .then(state => {
      const message = state
        ? `Error: File '${file}' is listed on the filesList`
        : `File '${file}' is not listed on the filesList`
      return client.assert.ok(!state, message)
    })
})

Then('folder {string} should not be listed on the webUI', folder => {
  return client.page.FilesPageElement.filesList()
    .isElementListed(folder, 'folder', client.globals.waitForNegativeConditionTimeout)
    .then(state => {
      const message = state
        ? `Error: Folder '${folder}' is listed on the filesList`
        : `Folder '${folder}' is not listed on the filesList`
      return client.assert.ok(!state, message)
    })
})

Then('the unshared elements should be in declined state on the webUI', async function() {
  for (const element of unsharedElements) {
    const isDeclined = await client.page
      .sharedWithMePage()
      .hasShareStatusByFilename(SHARE_STATE.declined, element)
    assert.ok(isDeclined, `Expected resource '${element}' to be in 'Declined' state but didn't.`)
  }
  return client
})

Then('the deleted elements should not be listed on the webUI', function() {
  return assertDeletedElementsAreNotListed()
})

Then('the deleted elements should not be listed on the webUI after a page reload', function() {
  client.refresh()
  return assertDeletedElementsAreNotListed()
})

Then('the versions list should contain {int} entries', async function(expectedNumber) {
  const count = await client.page.FilesPageElement.versionsDialog().getVersionsCount()
  return assert.strictEqual(count, expectedNumber)
})

Then('the versions list for resource {string} should contain {int} entry/entries', async function(
  resourceName,
  expectedNumber
) {
  const api = client.page.FilesPageElement
  await client.initAjaxCounters()
  await api.filesList().openSideBar(resourceName)
  await api.appSideBar().activatePanel('versions')
  await client.waitForOutstandingAjaxCalls()
  const count = await api.versionsDialog().getVersionsCount()

  assert.strictEqual(count, expectedNumber)

  await api.appSideBar().closeSidebarIfOpen()
  return this
})

Then('the content of file {string} for user {string} should be {string}', async function(
  file,
  user,
  content
) {
  const remote = await download(user, file)
  return client.assert.strictEqual(
    remote,
    content,
    `Failed asserting remote file ${file} is same as content ${content} for user${user}`
  )
})

When('the user restores the file to last version using the webUI', function() {
  return client.page.FilesPageElement.versionsDialog().restoreToPreviousVersion()
})

When('the user/public reloads the current page of the webUI', function() {
  return client.refresh()
})

Given('the user has reloaded the current page of the webUI', function() {
  return client.refresh()
})

When('the user marks all files for batch action using the webUI', function() {
  return client.page.FilesPageElement.filesList().checkAllFiles()
})

When('the user/public batch deletes the marked files using the webUI', function() {
  return client.page.personalPage().deleteAllCheckedFiles()
})

When('the user batch unshares these files using the webUI', async function(shares) {
  for (const item of shares.rows()) {
    await client.page.FilesPageElement.filesList().toggleFileOrFolderCheckbox('enable', item[0])
    unsharedElements.push(item[0])
  }

  return client.page.sharedWithMePage().unshareAllCheckedFiles()
})

When('the user batch deletes these files using the webUI', async function(fileOrFolders) {
  for (const item of fileOrFolders.rows()) {
    await client.page.FilesPageElement.filesList().toggleFileOrFolderCheckbox('enable', item[0])
    deletedElements.push(item[0])
  }

  return client.page.personalPage().deleteAllCheckedFiles()
})

When('the user batch declines these shares using the webUI', async function(fileOrFolders) {
  for (const item of fileOrFolders.rows()) {
    await client.page.FilesPageElement.filesList().toggleFileOrFolderCheckbox('enable', item[0])
  }

  return client.page.sharedWithMePage().batchDeclineShares()
})

When('the user unmarks these files for batch action using the webUI', async function(
  fileOrFolders
) {
  for (const item of fileOrFolders.rows()) {
    await client.page.FilesPageElement.filesList().toggleFileOrFolderCheckbox('disable', item[0])
  }
})

When('the user/public marks these files for batch action using the webUI', async function(
  fileOrFolders
) {
  for (const item of fileOrFolders.rows()) {
    await client.page.FilesPageElement.filesList().toggleFileOrFolderCheckbox('enable', item[0])
  }
})

Then('these files should be selected on the webUI', async function(fileOrFolders) {
  for (const item of fileOrFolders.rows()) {
    const status = await client.page.FilesPageElement.filesList().isResourceSelected(item[0])
    assert.strictEqual(true, status, item + ' is expected to be selected but is not selected')
  }
})

Then('these files should not be selected on the webUI', async function(fileOrFolders) {
  for (const item of fileOrFolders.rows()) {
    const status = await client.page.FilesPageElement.filesList().isResourceSelected(item[0])
    assert.strictEqual(false, status, item + ' is expected not to be selected but is selected')
  }
})

When('the user/public clears the selection of files', function() {
  return client.page.personalPage().clearFileSelectionIfAny()
})

When('the user clears the trashbin', function() {
  return client.page.trashbinPage().clearTrashbin()
})

When('the user batch restores the marked files using the webUI', function() {
  return client.page.FilesPageElement.filesList().restoreSelected()
})

When('the user opens the sidebar for file/folder {string} on the webUI', function(item) {
  return client.page.FilesPageElement.filesList().openSideBar(item)
})

When('the user switches to {string} panel in details panel using the webUI', function(item) {
  return client.page.FilesPageElement.appSideBar().activatePanel(item)
})

const theseResourcesShouldNotBeListed = async function(table) {
  for (const entry of table.rows()) {
    const state = await client.page.FilesPageElement.filesList().isElementListed(
      entry[0],
      'file',
      client.globals.waitForNegativeConditionTimeout
    )
    assert.ok(!state, `Expected resource '${entry[0]}' to be 'not present' but found 'present'`)
  }
}

/**
 * needs a heading line in the table
 */
Then('these folders/files/resources should not be listed on the webUI', function(table) {
  return theseResourcesShouldNotBeListed(table)
})

/**
 * needs a heading line in the table
 */
Then('as {string} these folders/files/resources should not be listed on the webUI', async function(
  user,
  entryList
) {
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
Then(
  'these folders/files/resources should not be listed in the folder {string} on the webUI',
  async function(folder, entryList) {
    await client.page.personalPage().navigateAndWaitTillLoaded(folder)
    return theseResourcesShouldNotBeListed(entryList)
  }
)

Then(
  'file/folder/resource {string} should not be listed in the folder {string} on the webUI',
  async function(file, target) {
    await client.page.personalPage().navigateAndWaitTillLoaded(target)
    return client.page.FilesPageElement.filesList()
      .isElementListed(file, 'file', client.globals.waitForNegativeConditionTimeout)
      .then(state => {
        return client.assert.ok(!state, `Error: Folder '${file}' is listed on the '${target}'`)
      })
  }
)

/**
 * currently this only works with the files page, on other pages the user cannot navigate into subfolders
 *
 * needs a heading line in the table
 */
Then(
  'as {string} these folders/files/resources should not be listed in the folder {string} on the webUI',
  async function(user, folder, entryList) {
    if (user !== client.globals.currentUser) {
      await loginHelper.reLoginAsUser(user)
    }
    await client.page.personalPage().navigateAndWaitTillLoaded(folder)
    return theseResourcesShouldNotBeListed(entryList)
  }
)

/**
 *
 * @param {DataTable} entryList the list needs a heading line
 */
const theseResourcesShouldBeListed = async function(entryList) {
  if (entryList.rows().length <= 0) {
    throw Error('Gherkin entry list is empty. Missing heading?')
  }

  for (const item of entryList.rows()) {
    await client.page.FilesPageElement.filesList().waitForFileVisible(item[0])
  }

  return client
}

const assertBreadCrumbIsNotDisplayed = function() {
  const breadcrumbXpath = client.page.personalPage().elements.breadcrumb.selector
  return client.expect.element(breadcrumbXpath).to.not.be.present
}

/**
 *
 * @param {string} resource
 * @param {boolean} clickable
 * @param {boolean} nonClickable
 */
const assertBreadcrumbIsDisplayedFor = async function(resource, clickable, nonClickable) {
  const breadcrumbElement = client.page
    .personalPage()
    .getBreadcrumbSelector(clickable, nonClickable)
  const resourceBreadcrumbXpath = util.format(
    breadcrumbElement.selector,
    xpathHelper.buildXpathLiteral(resource)
  )
  let isBreadcrumbVisible = false

  // lets hope that the breadcrumbs would not take longer than the "NEW" button
  await client.waitForElementVisible({
    selector: client.page.personalPage().elements.newFileMenuButtonAnyState.selector,
    abortOnFailure: false
  })

  await client.page.personalPage().checkBreadcrumbVisibility(resourceBreadcrumbXpath)

  await client.element('xpath', resourceBreadcrumbXpath, result => {
    if (result.status > -1) {
      isBreadcrumbVisible = true
    }
  })

  // Try to look for a mobile breadcrumbs in case it has not been found
  if (!isBreadcrumbVisible) {
    await appSideBar.closeSidebarIfOpen()
    const mobileBreadcrumbMobileXpath = util.format(
      client.page.personalPage().elements.breadcrumbMobile.selector,
      xpathHelper.buildXpathLiteral(resource)
    )

    await client.element('xpath', mobileBreadcrumbMobileXpath, result => {
      if (result.status > -1) {
        isBreadcrumbVisible = true
      }
    })
  }

  return client.assert.strictEqual(
    isBreadcrumbVisible,
    true,
    `Resource ${resourceBreadcrumbXpath} expected to be visible but is not visible .`
  )
}

/**
 * needs a heading line in the table
 */
Then('these files/folders/resources should be listed on the webUI', function(entryList) {
  return theseResourcesShouldBeListed(entryList)
})

/**
 * currently this only works with the files page, on other pages the user cannot navigate into subfolders
 *
 * needs a heading line in the table
 */
Then(
  'these files/folders/resources should be listed in the folder {string} on the webUI',
  async function(folder, entryList) {
    await client.page.personalPage().navigateAndWaitTillLoaded(folder)
    return theseResourcesShouldBeListed(entryList)
  }
)

/**
 * needs a heading line in the table
 */
Then('as {string} these files/folders/resources should be listed on the webUI', async function(
  user,
  entryList
) {
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
Then(
  'as {string} these files/folders/resources should be listed in the folder {string} on the webUI',
  async function(user, folder, entryList) {
    if (user !== client.globals.currentUser) {
      await loginHelper.reLoginAsUser(user)
    }
    await client.page.personalPage().navigateAndWaitTillLoaded(folder)
    return theseResourcesShouldBeListed(entryList)
  }
)

Then('as user {string} file/folder {string} should be marked as favorite', async function(
  userId,
  path
) {
  let isFavorite = await webdav.getProperties(path, userId, ['oc:favorite'])
  isFavorite = isFavorite['oc:favorite']

  return assert.strictEqual(isFavorite, '1', `${path} expected to be favorite but was not`)
})

Then('as user {string} file/folder {string} should not be marked as favorite', async function(
  userId,
  path
) {
  let isFavorite = await webdav.getProperties(path, userId, ['oc:favorite'])
  isFavorite = isFavorite['oc:favorite']

  return assert.strictEqual(isFavorite, '0', `not expected ${path} to be favorite but was`)
})

Then('file/folder {string} should be marked as favorite on the webUI', async function(path) {
  const selector = client.page.FilesPageElement.appSideBar().elements.fileInfoFavoriteShining
  await client.page.FilesPageElement.filesList().openSideBar(path)

  await client.waitForElementPresent(selector)
  await client.page.FilesPageElement.appSideBar().closeSidebarIfOpen()

  return client
})

Then('file/folder {string} should not be marked as favorite on the webUI', async function(path) {
  const selector = client.page.FilesPageElement.appSideBar().elements.fileInfoFavoriteDimm
  await client.page.FilesPageElement.filesList().openSideBar(path)

  client.expect.element(selector).to.be.present
  await client.page.FilesPageElement.appSideBar().closeSidebarIfOpen()

  return client
})

Then(/the count of files and folders shown on the webUI should be (\d+)/, async function(
  noOfItems
) {
  const itemsCount = await client.page.FilesPageElement.filesList().countFilesAndFolders()
  return client.assert.equal(itemsCount, noOfItems)
})

Then('the app-sidebar should be visible', async function() {
  const visible = await client.page.FilesPageElement.appSideBar().isSideBarOpen()
  assert.strictEqual(visible, true, 'app-sidebar should be visible, but is not')
})

Then('the app-sidebar should be invisible', async function() {
  const visible = await client.page.FilesPageElement.appSideBar().isSideBarOpen()
  assert.strictEqual(visible, false, 'app-sidebar should be invisible, but is not')
})

Then('the {string} details panel should be visible', async function(panel) {
  await client.page.FilesPageElement.appSideBar().activatePanel(panel)
  const expanded = await client.page.FilesPageElement.appSideBar().isPanelActive(panel)
  assert.strictEqual(expanded, true, `'${panel}-panel' should be active, but is not`)
})

Then('the following panels should be visible in the details dialog on the webUI', async function(
  table
) {
  const visibleItems = await client.page.FilesPageElement.appSideBar().getVisibleAccordionItems()
  const expectedVisibleItems = table.rows()
  const difference = _.difference(expectedVisibleItems.flat(), visibleItems)
  if (difference.length !== 0) {
    throw new Error(`${difference} panels was expected to be visible but not found.`)
  }
})

const assertElementsAreListed = async function(elements) {
  for (const element of elements) {
    const state = await client.page.FilesPageElement.filesList().isElementListed(element)
    assert.ok(state, `Expected resource '${element}' to be 'present' but found 'not present'`)
  }
  return client
}

const assertElementsAreNotListed = async function(elements) {
  for (const element of elements) {
    const state = await client.page.FilesPageElement.filesList().isElementListed(
      element,
      'any',
      client.globals.waitForNegativeConditionTimeout
    )
    assert.ok(!state, `Expected resource '${element}' to be 'not present' but found 'present'`)
  }
  return client
}

const assertDeletedElementsAreNotListed = function() {
  return assertElementsAreNotListed(deletedElements)
}

const assertDeletedElementsAreListed = function() {
  return assertElementsAreListed(deletedElements)
}

When(/^the user restores (file|folder) "([^"]*)" from the trashbin using the webUI$/, function(
  elementType,
  element
) {
  return client.page.FilesPageElement.filesList().restoreFile(element, elementType)
})

Then('the following files/folders/resources should be listed on the webUI', function(table) {
  return assertElementsAreListed([].concat.apply([], table.rows()))
})

Then('file/folder {string} should be listed in the folder {string} on the webUI', async function(
  file,
  folder
) {
  const api = client.page.FilesPageElement.filesList()

  await api.navigateToFolder(folder)

  await api.waitForFileVisible(file)

  return client
})

Then('the deleted elements should be listed on the webUI', function() {
  return assertDeletedElementsAreListed()
})

Given('user {string} has renamed the following files', function(userId, table) {
  return Promise.all(
    table.hashes().map(row => {
      return webdav.move(userId, row['from-name-parts'], row['to-name-parts'])
    })
  )
})

Given('user {string} has renamed file/folder {string} to {string}', webdav.move)

Given('user {string} has created folder {string}', webdav.createFolder)

Given('user {string} has created folder {string} on remote server', function(userId, folderName) {
  return backendHelper.runOnRemoteBackend(async function() {
    await webdav.createFolder(userId, folderName)
  })
})

Given('user {string} has created file {string} on remote server', function(userId, fileName) {
  return backendHelper.runOnRemoteBackend(async function() {
    await webdav.createFile(userId, fileName, '')
  })
})

Then(
  'file/folder {string} should not be listed in shared-with-others page on the webUI',
  async function(filename) {
    await client.page.sharedWithOthersPage().navigateAndWaitTillLoaded()
    const state = await client.page.FilesPageElement.filesList().isElementListed(filename)
    assert.ok(
      !state,
      `Error: Resource ${filename} is present on the shared-with-others page on the webUI`
    )
  }
)

Then(
  'file/folder {string} should be listed in shared-with-others page on the webUI',
  async function(filename) {
    await client.page.sharedWithOthersPage().navigateAndWaitTillLoaded()
    await client.page.FilesPageElement.filesList().waitForFileVisible(filename)

    return client
  }
)

Given('user {string} has created file {string}', function(userId, fileName) {
  return webdav.createFile(userId, fileName, '')
})

Given('user {string} has created the following folders', async function(userId, entryList) {
  for (const entry of entryList.rows()) {
    await webdav.createFolder(userId, entry[0])
  }
  return client
})

Given('user {string} has created the following files', async function(userId, entryList) {
  for (const entry of entryList.rows()) {
    await webdav.createFile(userId, entry[0])
  }
  return client
})

When('the user/public creates the following folders using the webUI', async function(entryList) {
  for (const entry of entryList.rows()) {
    await client.page.personalPage().createFolder(entry[0])
  }
})

When('the user browses to the folder {string} on the files page', folderName => {
  const targetFolder = folderName === '/' ? '' : folderName
  return client.page.personalPage().navigateAndWaitTillLoaded(targetFolder)
})

Then(
  'as user {string} the clipboard content should match permalink of resource {string}',
  async function(userId, folderName) {
    const folderData = await webdav.getProperties(folderName, userId, ['oc:privatelink'])
    return client.getClipBoardContent(function(value) {
      assert.strictEqual(folderData['oc:privatelink'], value)
    })
  }
)

When(
  /^the user opens the actions sidebar panel of (file|folder) "([^"]*)" on the webUI$/,
  async function(elementType, resource) {
    await client.page.FilesPageElement.filesList().openFileActionsMenu(resource, elementType)
  }
)

Then(/^the app-sidebar for (file|folder) "([^"]*)" should be visible on the webUI$/, async function(
  elementType,
  resource
) {
  const visible = await client.page.FilesPageElement.appSideBar().isSideBarOpenForResource(
    resource,
    elementType
  )
  assert.strictEqual(visible, true, 'app-sidebar should be visible, but is not')
})

Then('the thumbnail should be visible in the app-sidebar', function() {
  return client.page.FilesPageElement.appSideBar().isThumbnailVisible()
})

When('the user deletes the file {string} from the deleted files list', function(element) {
  return client.page.FilesPageElement.filesList().deleteImmediately(element)
})

async function isPossibleToDeleteResourceOnWebUI(resource) {
  return !(await client.page.FilesPageElement.filesList().isActionAttributeDisabled(
    'delete',
    resource
  ))
}

Then('it should not be possible to delete file/folder {string} using the webUI', async function(
  resource
) {
  assert.strictEqual(
    await isPossibleToDeleteResourceOnWebUI(resource),
    false,
    `expected delete function of ${resource} to be disabled but it is enabled`
  )
})

Then('it should be possible to delete file/folder {string} using the webUI', async function(
  resource
) {
  assert.strictEqual(
    await isPossibleToDeleteResourceOnWebUI(resource),
    true,
    `expected delete function of ${resource} to be enabled but it is disabled`
  )
})

Then('it should not be possible to rename file/folder {string} using the webUI', async function(
  resource
) {
  const state = await client.page.FilesPageElement.filesList().isActionAttributeDisabled(
    'rename',
    resource
  )
  assert.ok(state, `expected property disabled of ${resource} to be 'true' but found ${state}`)
})

When('the user uploads overwriting file {string} using the webUI', async function(file) {
  const uploadPath = path.join(client.globals.mountedUploadDir, file)
  await client.page.personalPage().selectFileForUpload(uploadPath)
  await client.page.personalPage().confirmFileOverwrite()

  return this
})

When(
  'the user tries to create a file with already existing name {string} using the webUI',
  function(fileName) {
    return client.page.personalPage().createFile(fileName, false)
  }
)

Then('the create file/folder button should be disabled', function() {
  return client.page.personalPage().checkForButtonDisabled()
})

When('user {string} has renamed the following file', function(user, table) {
  const fromName = table
    .hashes()
    .map(data => data['from-name-parts'])
    .join('')
  const toName = table
    .hashes()
    .map(data => data['to-name-parts'])
    .join('')
  return webdav.move(user, fromName, toName)
})

Then('the following file should not be listed on the webUI', async function(table) {
  const name = table
    .hashes()
    .map(data => data['name-parts'])
    .join('')
  const state = await client.page.FilesPageElement.filesList().isElementListed(name)
  return assert.ok(!state, `Element ${name} is present on the filesList!`)
})

Then('the user deletes the following file using the webUI', function(table) {
  const name = table
    .hashes()
    .map(data => data['name-parts'])
    .join('')
  return client.page.FilesPageElement.filesList().deleteFile(name)
})

Then('the user should be redirected to the files-drop page', function() {
  return client.page.filesDropPage().waitForPage()
})

Then('the user should be redirected to the public links page', function() {
  return client.page.publicLinkFilesPage().waitForPage()
})

Then('file/folder {string} shared by {string} should not be listed on the webUI', async function(
  element,
  sharer
) {
  const found = await client.page.sharedWithMePage().isSharePresent(element, sharer)
  assert.ok(
    !found,
    element + ' shared by ' + sharer + ' was present but was not expected to be present'
  )
})

Then('the page should be empty', async function() {
  const isVisible = await client.page.webPage().isPageVisible()
  assert.ok(!isVisible, 'The web page should be empty but is not')
})

When('the user downloads file/folder {string} using the webUI', function(file) {
  return client.page.FilesPageElement.filesList().downloadFile(file)
})

Then('the following resources should have share indicators on the webUI', async function(
  dataTable
) {
  for (const { fileName, expectedIndicators } of dataTable.hashes()) {
    const indicatorsArray = await client.page.FilesPageElement.filesList().getShareIndicatorsForResourceWithRetry(
      fileName,
      true
    )
    const expectedIndicatorsArray = expectedIndicators.split(',').map(s => s.trim())
    assert.ok(
      _.intersection(indicatorsArray, expectedIndicatorsArray).length ===
        expectedIndicatorsArray.length,
      `Expected share indicators to be the same for "${fileName}": expected [` +
        expectedIndicatorsArray.join(', ') +
        '] got [' +
        indicatorsArray.join(', ') +
        ']'
    )
  }
})

Then('the following resources should not have share indicators on the webUI', async function(
  dataTable
) {
  for (const [fileName] of dataTable.raw()) {
    const indicatorsArray = await client.page.FilesPageElement.filesList().getShareIndicatorsForResource(
      fileName,
      false
    )

    assert.ok(!indicatorsArray.length, `Expected no share indicators present for "${fileName}"`)
  }
})

async function _setFilesTableSort(column, isDesc) {
  await client.page.FilesPageElement.filesList().setSort(column, isDesc)
}

When('the user has set the sort order of the {string} column to descending order', async function(
  column
) {
  await _setFilesTableSort(column, true)
})
When('the user has set the sort order of the {string} column to ascending order', async function(
  column
) {
  await _setFilesTableSort(column, false)
})
Then('the file {string} should have a thumbnail displayed on the webUI', async function(resource) {
  const iconUrl = await client.page.FilesPageElement.filesList().getResourceThumbnail(
    resource,
    'file'
  )
  assert.ok(iconUrl, 'Icon URL expected to be set when thumbnail is displayed')
})
Then('the file {string} should have a file type icon displayed on the webUI', async function(
  resource
) {
  const iconUrl = await client.page.FilesPageElement.filesList().getResourceThumbnail(
    resource,
    'file'
  )
  assert.strictEqual(null, iconUrl, 'No icon URL expected when file type icon is displayed')
})

Then('quick action {string} should be displayed on the webUI', function(action) {
  return client.page.FilesPageElement.filesRow().isQuickActionVisible(action)
})

When('the user moves file/folder {string} into folder {string} using the webUI', function(
  resource,
  target
) {
  return client.page.FilesPageElement.filesList().moveResource(resource, target)
})

When('the user tries to move file/folder {string} into folder {string} using the webUI', function(
  resource,
  target
) {
  return (
    client.page.FilesPageElement.filesList()
      .moveResource(resource, target)
      // while moving resource, after clicking the "Paste here" button, the button should disappear but if it doesn't
      // we throw "ElementPresentError" error. So, all the error except "ElementPresentError" is caught and thrown back
      // Also, when no error is thrown, the button seems to disappear, so an error should be thrown in such case as well.
      .then(() => {
        throw new Error('ElementPresentError')
      })
      .catch(err => {
        if (err.message !== 'ElementPresentError') {
          throw new Error(err)
        }
      })
  )
})

Then('the move here file/folder button should be disabled', function() {
  return client.page.personalPage().checkForButtonMoveHereDisabled()
})

When('the user selects move action for folder/file {string} using the webUI', async function(
  resource
) {
  await client.page.FilesPageElement.filesList().openFileActionsMenu(resource)
  return await client.page.FilesPageElement.fileActionsMenu().move()
})

When('the user cancels the attempt to move/copy resources using the webUI', function() {
  return client.page.FilesPageElement.filesList().cancelResourceMoveOrCopyProgress()
})

When(
  'the user batch moves these files/folders into folder {string} using the webUI',
  async function(target, resources) {
    for (const item of resources.rows()) {
      await client.page.FilesPageElement.filesList().toggleFileOrFolderCheckbox('enable', item[0])
    }

    return client.page.personalPage().moveMultipleResources(target)
  }
)

When(
  'the user tries to batch move these files/folders into folder {string} using the webUI',
  async function(target, resources) {
    for (const item of resources.rows()) {
      await client.page.FilesPageElement.filesList().toggleFileOrFolderCheckbox('enable', item[0])
    }

    return client.page.personalPage().attemptToMoveMultipleResources(target)
  }
)

When('the user selects the move button to move files using the webUI', function() {
  return client.page.personalPage().click('@moveSelectedBtn')
})

When('the user copies file/folder {string} into folder {string} using the webUI', function(
  resource,
  target
) {
  return client.page.FilesPageElement.filesList().copyResource(resource, target)
})

When('the user tries to copy file/folder {string} into folder {string} using the webUI', function(
  resource,
  target
) {
  return client.page.FilesPageElement.filesList()
    .copyResource(resource, target)
    .catch(error => {
      // while copying resource, after clicking the "Paste here" button, the button should disappear but if it doesn't
      // we throw "ElementPresentError" error. So, all the error except "ElementPresentError" is caught and thrown back
      if (error.message !== 'ElementPresentError') throw error
    })
})

When('the user selects copy action for file/folder {string} using the webUI', async function(
  resource
) {
  await client.page.FilesPageElement.filesList().openFileActionsMenu(resource)
  return await client.page.FilesPageElement.fileActionsMenu().copy()
})

When(
  'the user selects the folder {string} as a place to copy/move the file/files/folder/folders using the webUI',
  async function(target) {
    await client.page.locationPicker().selectFolder(target)
  }
)

When(
  'the user batch copies these files/folders into folder {string} using the webUI',
  async function(target, resources) {
    for (const item of resources.rows()) {
      await client.page.FilesPageElement.filesList().toggleFileOrFolderCheckbox('enable', item[0])
    }

    return await client.page.personalPage().copyMultipleResources(target)
  }
)

When('the user selects the copy button to copy files using the webUI', function() {
  return client.page.personalPage().click('@copySelectedBtn')
})

When('the user creates a markdown file with the name {string} using the webUI', function(fileName) {
  return client.page.personalPage().createMarkdownFile(fileName)
})

When('the user closes the text editor using the webUI', function() {
  return client.page.personalPage().closeTextEditor()
})

Then('the user should be in the root directory on the webUI', async function() {
  const isUserInRootDirectory = await client.page.personalPage().isRootDirectory()
  assert.ok(!isUserInRootDirectory, 'Expected user in the root directory but found elsewhere')
})

Then('the search bar should not be visible on the webUI', async function() {
  await client.page.FilesPageElement.filesList().waitForLoadingFinished(false)
  const isVisible = await client.page.personalPage().isSearchBarVisible()
  assert.strictEqual(isVisible, false, 'Expected search bar to be invisible but is visible')
})

Then('the search bar should be visible on the webUI', async function() {
  await client.page.FilesPageElement.filesList().waitForLoadingFinished(false)
  const isVisible = await client.page.personalPage().isSearchBarVisible()
  assert.strictEqual(isVisible, true, 'Expected search bar to be visible but is not visible')
})

Then(
  /^the preview image of file "([^"]*)" (should|should not) be displayed in the file list view on the webUI$/,
  function(fileName, shouldOrShouldnot) {
    return client.page.FilesPageElement.filesList().checkPreviewImage(
      fileName,
      shouldOrShouldnot === 'should'
    )
  }
)

Then(
  'only the following items with default items should be visible in the actions menu on the webUI',
  async function(table) {
    const visibleItems = await client.page.FilesPageElement.appSideBar().getActionsMenuItemsExceptDefaults()

    const tableItems = table.rows()
    const expectedVisibleItems = []
    tableItems.forEach(element => {
      element instanceof Array
        ? expectedVisibleItems.push(element[0])
        : expectedVisibleItems.push(element)
    })

    const isPresent = _.isEqual(_.sortBy(expectedVisibleItems), _.sortBy(visibleItems))
    assert.strictEqual(
      isPresent,
      true,
      `only '${expectedVisibleItems}' actions menu item(s) was expected to be visible but found '${visibleItems}' instead.`
    )
  }
)

Then(
  'the resource {string} should have the token of last link in the people column on the webUI',
  async resource => {
    const lastLink = await sharingHelper.fetchLastPublicLinkShare(client.globals.currentUser)
    const collaboratorsArray = await client.page
      .sharedWithOthersPage()
      .getCollaboratorsForResource(resource)

    assert.ok(collaboratorsArray.indexOf(lastLink.token) > -1)
  }
)

Given('user {string} has locked file/folder {string} setting following properties', function(
  userId,
  fileName,
  table
) {
  const properties = table.rowsHash()
  return webdav.lockResource(userId, fileName, properties)
})

When('the user closes rename dialog', function() {
  return client.page.FilesPageElement.filesList().closeRenameDialog()
})

Then('notifications should be displayed on the webUI with the text', async function(message) {
  const actualMessages = await client.page.webPage().getPopupErrorMessages()
  const isMessageShown = assertIncludesMessage(actualMessages, message)

  assert.strictEqual(isMessageShown, true, `Expected '${message}' but not found`)
})

function assertIncludesMessage(messageArr, message) {
  if (messageArr.includes(message)) {
    return true
  } else {
    return false
  }
}
