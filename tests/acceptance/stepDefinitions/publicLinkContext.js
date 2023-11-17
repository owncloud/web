const { client } = require('nightwatch-api')
const { When, Then } = require('@cucumber/cucumber')
require('url-search-params-polyfill')
const sharingHelper = require('../helpers/sharingHelper')
const assert = require('assert')
const loginHelper = require('../helpers/loginHelper')
let lastLinkShare = null

When(
  'the user (tries to )create/creates a new public link for file/folder/resource {string} using the webUI',
  async function (resource) {
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    return client.page.FilesPageElement.publicLinksDialog().addNewLink()
  }
)

When(
  'the user sets the role of the most recently created public link of resource {string} to {string}',
  async function (resource, newRole) {
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    await client.page.FilesPageElement.publicLinksDialog().changeLatestLinkRole(newRole)
  }
)

Then(
  'the link expiration date shown on the webUI should be {string} days',
  async function (expectedDays) {
    const expectedDate = sharingHelper.calculateDate(expectedDays)
    const expectedDateString = expectedDate.toString()
    const dateStringFromInputField =
      await client.page.FilesPageElement.publicLinksDialog().getExpirationDate()
    assert.strictEqual(
      dateStringFromInputField,
      expectedDateString,
      `Expected: Expiration date field with ${expectedDateString}, but found ${dateStringFromInputField}`
    )
  }
)

Then('the password input for the public link should appear on the webUI', function () {
  return client.page.publicLinkPasswordPage().waitForVisible()
})

When(
  'the user accesses the public link with password {string} using the webUI',
  function (password) {
    return client.page.publicLinkPasswordPage().submitPublicLinkPassword(password)
  }
)

When(
  'the public uses the webUI to access the last public link created by user {string} in a new session',
  function (linkCreator) {
    return loadPublicLink(linkCreator)
  }
)

When(
  'the public uses the webUI to access the last public link created by user {string} with password {string} in a new session',
  function (linkCreator, password) {
    return loadPublicLinkWithPassword(linkCreator, password)
  }
)

When('the user navigates to the root of the last public link', function () {
  return client.page.publicLinkFilesPage().navigateToRootFolder(lastLinkShare.name)
})

const loadPublicLink = async function (linkCreator, newSession = true) {
  lastLinkShare = await sharingHelper.fetchLastPublicLinkShare(linkCreator)
  if (newSession) {
    await loginHelper.startNewSession()
  }
  if (lastLinkShare.permissions === sharingHelper.PERMISSION_TYPES.create) {
    return client.page.filesDropPage().navigateAndWaitTillLoaded(lastLinkShare.token)
  }
  return client.page.publicLinkFilesPage().navigateAndWaitTillLoaded(lastLinkShare.token)
}

const loadPublicLinkWithPassword = async function (linkCreator, password, newSession = true) {
  lastLinkShare = await sharingHelper.fetchLastPublicLinkShare(linkCreator)
  if (newSession) {
    await loginHelper.startNewSession()
  }
  if (lastLinkShare.permissions === sharingHelper.PERMISSION_TYPES.create) {
    await client.page.filesDropPage().navigateAndWaitForPasswordPage(lastLinkShare.token)
  } else {
    await client.page.publicLinkFilesPage().navigateAndWaitForPasswordPage(lastLinkShare.token)
  }
  return client.page.publicLinkPasswordPage().submitPublicLinkPassword(password)
}

Then('the public should not get access to the publicly shared file', async function () {
  const message = await client.page
    .publicLinkPasswordPage()
    .submitLinkPasswordForm() // form is submitted as password input is filled in the step before this particular step in 'when' part
    .getResourceAccessDeniedMsg()
  return assert.strictEqual(
    'This resource is password-protected',
    message,
    'Resource protected message invalid, Found: ',
    message
  )
})

When(
  'the user renames the most recently created public link of file/folder/resource {string} to {string}',
  async function (resource, newName) {
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    await client.page.FilesPageElement.publicLinksDialog().changeLatestLinkName(newName)
  }
)

When(
  'the user renames the public link named {string} of file/folder/resource {string} to {string}',
  async function (linkName, resource, newName) {
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    await client.page.FilesPageElement.publicLinksDialog().changeName(linkName, newName)
  }
)

When(
  'the user edits the public link named {string} of file/folder/resource {string} changing expireDate to {string}',
  async function (linkName, resource, expiry) {
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    await client.page.FilesPageElement.publicLinksDialog().changeExpirationDate(linkName, expiry)
  }
)

Then(
  'the user should see a password modal dialog with message {string} on the webUI',
  async function (expectedMessage) {
    const actualMessage =
      await client.page.FilesPageElement.publicLinksDialog().getErrorMessageFromModal()
    return client.assert.strictEqual(actualMessage, expectedMessage)
  }
)

When(
  'the user tries to edit the public link named {string} of file/folder/resource {string} changing the role to {string}',
  async function (linkName, resource, role) {
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    await client.page.FilesPageElement.publicLinksDialog().changeRole(linkName, role)
  }
)

When(
  'the user tries to edit the public link named {string} of file/folder/resource {string} changing the password to {string}',
  async function (linkName, resource, password) {
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    await client.page.FilesPageElement.publicLinksDialog().changePassword(linkName, password)
  }
)

When(
  'the user sets a password {string} for the public link in the modal',
  async function (password) {
    await client.page.FilesPageElement.publicLinksDialog().setRequiredPassword(password)
  }
)

When(
  'the user tries to edit the public link named {string} of file/folder/resource {string} adding a password {string}',
  async function (linkName, resource, password) {
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    await client.page.FilesPageElement.publicLinksDialog().addPassword(linkName, password)
  }
)
When(
  'the user opens the link edit dialog of file/folder/resource {string} with name {string} using the webUI',
  async function (resource, linkName) {
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    await client.page.FilesPageElement.publicLinksDialog().clickLinkEditBtn(linkName)
  }
)

Then(
  'it should not be possible to remove password for the link with name {string}',
  async function (linkName) {
    const isVisible =
      await client.page.FilesPageElement.publicLinksDialog().isRemovePasswordBtnVisible(
        linkName,
        false
      )
    return assert.strictEqual(
      isVisible,
      false,
      `Expected "Remove password" button to be invisible but found visible`
    )
  }
)

When(
  'the user tries to edit expiration of the public link named {string} of file {string} to past date {string}',
  async function (linkName, resource, pastDate) {
    const api = client.page.FilesPageElement
    await api.filesList().openPublicLinkDialog(resource)
    await api.publicLinksDialog().clickLinkEditBtn(linkName)
    const value = sharingHelper.calculateDate(pastDate)
    const dateToSet = new Date(Date.parse(value))
    await api.publicLinksDialog().clickLinkEditExpirationBtn(linkName)
    const isDisabled = await api.expirationDatePicker().isExpiryDateDisabled(dateToSet)
    return assert.ok(isDisabled, 'Expected expiration date to be disabled but found not disabled')
  }
)

When(
  'the user removes the public link named {string} of file/folder/resource {string} using the webUI',
  async function (linkName, resource) {
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    return client.page.FilesPageElement.publicLinksDialog().removePublicLink(linkName)
  }
)

When(
  'the user cancels remove the public link named {string} of file/folder/resource {string} using the webUI',
  async function (linkName, resource) {
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    return client.page.FilesPageElement.publicLinksDialog().cancelRemovePublicLink(linkName)
  }
)

Then(
  'public link named {string} should not be listed on the public links list on the webUI',
  async function (linkName) {
    const isPresent =
      await client.page.FilesPageElement.publicLinksDialog().isPublicLinkPresent(linkName)
    return assert.ok(
      !isPresent,
      `expected public-link '${linkName}' to be 'not listed' but got found`
    )
  }
)

async function findMatchingPublicLinkByName(name, role, resource, via = null) {
  await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)

  const shares = await client.page.FilesPageElement.publicLinksDialog().getPublicLinkList()

  const share = shares.find((link) => link.name === name)

  if (!share) {
    assert.fail(
      `Link with name "${name}" was expected to be in share list but was not present. Found links: ` +
        shares.map((share) => share.name)
    )
  }

  assert.strictEqual(role, share.role)
  if (via !== null) {
    assert.ok(share.viaLabel, 'Expected "shared via" icon to be displayed but was not visible')
  }
}

Then(
  'a link named {string} should be listed with role {string} in the public link list of file/folder/resource {string} on the webUI',
  async function (name, role, resource) {
    await findMatchingPublicLinkByName(name, role, resource)
  }
)

Then(
  'a link named {string} should be listed with role {string} in the public link list of file/folder/resource {string} via {string} on the webUI',
  async function (name, role, resource, via) {
    await findMatchingPublicLinkByName(name, role, resource, via)
  }
)

Then(
  'the user should see an error message on the public link share dialog saying {string}',
  async function (expectedMessage) {
    const actualMessage = await client.page.FilesPageElement.publicLinksDialog().getErrorMessage()
    return client.assert.strictEqual(actualMessage, expectedMessage)
  }
)

Then(
  'the user should see an error message on the public link edit modal dialog saying {string}',
  async function (expectedMessage) {
    const actualMessage =
      await client.page.FilesPageElement.publicLinksDialog().getErrorMessageFromModal()
    return client.assert.strictEqual(actualMessage, expectedMessage)
  }
)

When(
  'the user copies the url of public link named {string} of file/folder/resource {string} using the webUI',
  async function (linkName, resource) {
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    return client.page.FilesPageElement.publicLinksDialog().copyPublicLinkURI(linkName)
  }
)

Then('the tokens should be unique for each public links on the webUI', async function () {
  const publicLinkUrls = await client.page.FilesPageElement.publicLinksDialog().getPublicLinkUrls()
  const isUnique = publicLinkUrls.length === new Set(publicLinkUrls).size
  return assert.ok(isUnique)
})

When(
  'the user creates a public link via quick action for resource {string} using the webUI',
  function (resource) {
    return client.page.FilesPageElement.filesList().useQuickAction(resource, 'quicklink')
  }
)
