const { client } = require('nightwatch-api')
const { When, Then } = require('cucumber')
require('url-search-params-polyfill')
const sharingHelper = require('../helpers/sharingHelper')
const assert = require('assert')
const { SHARE_TYPES } = require('../helpers/sharingHelper')
const path = require('../helpers/path')
const loginHelper = require('../helpers/loginHelper')

When(
  'the user (tries to )create/creates a new public link for file/folder/resource {string} using the webUI',
  async function(resource) {
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    return client.page.FilesPageElement.publicLinksDialog().addNewLink()
  }
)

When(
  'the user (tries to )create/creates a new public link for file/folder/resource {string} using the webUI with',
  async function(resource, settingsTable) {
    const settings = settingsTable.rowsHash()
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    return client.page.FilesPageElement.publicLinksDialog().addNewLink(settings)
  }
)

When(
  'the user (tries to) create a new public link for file/folder/resource {string} which expires in {string} day/days using the webUI',
  async function(resource, days) {
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    return client.page.FilesPageElement.publicLinksDialog().setPublicLinkDate(days)
  }
)

When(
  'the public uses the webUI to access the last public link created by user {string}',
  async function(linkCreator) {
    const lastShare = await sharingHelper.fetchLastPublicLinkShare(linkCreator)
    if (lastShare.permissions === sharingHelper.PERMISSION_TYPES.create) {
      return client.page.filesDropPage().navigateAndWaitTillLoaded(lastShare.token)
    }
    return client.page.publicLinkFilesPage().navigateAndWaitTillLoaded(lastShare.token)
  }
)

Then('the password input for the public link should appear on the webUI', function() {
  return client.page.publicLinkPasswordPage().waitForVisible()
})

When('the user accesses the public link with password {string} using the webUI', function(
  password
) {
  return client.page.publicLinkPasswordPage().submitPublicLinkPassword(password)
})

When(
  'user {string} changes the password of last public link  to {string} using the Sharing API',
  async function(user, password) {
    const lastShare = await sharingHelper.fetchLastPublicLinkShare(user)
    await sharingHelper.updatePublicLinkPassword(user, lastShare.id, password)
  }
)

When(
  'the public uses the webUI to access the last public link created by user {string} with password {string}',
  function(linkCreator, password) {
    return loadPublicLinkWithPassword(linkCreator, password, false)
  }
)

When(
  'the public uses the webUI to access the last public link created by user {string} with password {string} on a new session',
  function(linkCreator, password) {
    return loadPublicLinkWithPassword(linkCreator, password, true)
  }
)

const loadPublicLinkWithPassword = async function(linkCreator, password, newSession) {
  const lastShare = await sharingHelper.fetchLastPublicLinkShare(linkCreator)
  if (newSession) {
    await loginHelper.startNewSession()
  }
  if (lastShare.permissions === sharingHelper.PERMISSION_TYPES.create) {
    await client.page.filesDropPage().navigateAndWaitForPasswordPage(lastShare.token)
  } else {
    await client.page.publicLinkFilesPage().navigateAndWaitForPasswordPage(lastShare.token)
  }
  return client.page.publicLinkPasswordPage().submitPublicLinkPassword(password)
}

const editPublicLink = async function(linkName, resource, dataTable) {
  const editData = dataTable.rowsHash()
  await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
  await client.page.FilesPageElement.publicLinksDialog().editPublicLink(linkName, editData)
  return client.page.FilesPageElement.publicLinksDialog().savePublicLink()
}

Then('user {string} should not have any public link', async function(sharer) {
  const resp = await sharingHelper.getAllPublicLinkShares(sharer)
  assert.strictEqual(resp.length, 0, 'User has shares. Response: ' + resp)
})

Then('user {string} should have some public shares', async function(sharer) {
  const publicShares = await sharingHelper.getAllPublicLinkShares(sharer)
  if (publicShares.length === 0) {
    assert.fail('Shares not found')
  }
})

Then('the fields of the last public link share response of user {string} should include', function(
  linkCreator,
  dataTable
) {
  const fieldsData = dataTable.rowsHash()
  return sharingHelper.assertUserLastPublicShareDetails(linkCreator, fieldsData)
})

Then('as user {string} the folder {string} should not have any public link', async function(
  sharer,
  resource
) {
  const publicLinkShares = await sharingHelper.getAllPublicLinkShares(sharer)
  resource = path.resolve(resource)
  for (const share of publicLinkShares) {
    if (share.path === resource && share.share_type === SHARE_TYPES.public_link) {
      assert.fail(
        'Expected share with user ' +
          sharer +
          ' and resource ' +
          resource +
          ' is present!\n' +
          JSON.stringify(publicLinkShares)
      )
    }
  }
  return this
})

Then('the public should not get access to the publicly shared file', async function() {
  const message = await client.page
    .publicLinkPasswordPage()
    .submitLinkPasswordForm() // form is submitted as password input is filled in the step before this particular step in 'when' part
    .getResourceAccessDeniedMsg()
  return assert.strictEqual(
    'This resource is password-protected.',
    message,
    'Resource protected message invalid, Found: ',
    message
  )
})

When(
  'the user edits the public link named {string} of file/folder/resource {string} changing following but not saving',
  async function(linkName, resource, dataTable) {
    const editData = dataTable.rowsHash()
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    return client.page.FilesPageElement.publicLinksDialog().editPublicLink(linkName, editData)
  }
)

When(
  'the user edits the public link named {string} of file/folder/resource {string} changing following',
  async function(linkName, resource, dataTable) {
    await editPublicLink(linkName, resource, dataTable)
  }
)

When(
  'the user tries to edit the public link named {string} of file/folder/resource {string} changing following',
  function(linkName, resource, dataTable) {
    return (
      editPublicLink(linkName, resource, dataTable)
        // while editing public link, after clicking the "Save" button, the button should disappear but if it doesn't
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
  }
)

When(
  'the user tries to edit expiration of the public link named {string} of file {string} to past date {string}',
  async function(linkName, resource, pastDate) {
    const api = client.page.FilesPageElement
    await api.filesList().openPublicLinkDialog(resource)
    await api.publicLinksDialog().clickLinkEditBtn(linkName)
    const value = sharingHelper.calculateDate(pastDate)
    const dateToSet = new Date(Date.parse(value))
    const isDisabled = await api
      .sharingDialog()
      .openExpirationDatePicker()
      .isExpiryDateDisabled(dateToSet)
    return assert.ok(isDisabled, 'Expected expiration date to be disabled but found not disabled')
  }
)

When(
  'the user removes the public link named {string} of file/folder/resource {string} using the webUI',
  async function(linkName, resource) {
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    return client.page.FilesPageElement.publicLinksDialog().removePublicLink(linkName)
  }
)

When(
  'the user cancels remove the public link named {string} of file/folder/resource {string} using the webUI',
  async function(linkName, resource) {
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    return client.page.FilesPageElement.publicLinksDialog().cancelRemovePublicLink(linkName)
  }
)

Then(
  'public link named {string} should not be listed on the public links list on the webUI',
  async function(linkName) {
    const isPresent = await client.page.FilesPageElement.publicLinksDialog().isPublicLinkPresent(
      linkName
    )
    return assert.ok(
      !isPresent,
      `expected public-link '${linkName}' to be 'not listed' but got found`
    )
  }
)

async function findMatchingPublicLinkByName(name, role, resource, via = null) {
  await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)

  const shares = await client.page.FilesPageElement.publicLinksDialog().getPublicLinkList()

  const share = shares.find(link => link.name === name)

  if (!share) {
    assert.fail(
      `Link with name "${name}" was expected to be in share list but was not present. Found links: ` +
        shares.map(share => share.name)
    )
  }

  assert.strictEqual(role, share.role)
  if (via !== null) {
    assert.strictEqual('Via ' + via, share.viaLabel)
  }
}

Then(
  'a link named {string} should be listed with role {string} in the public link list of file/folder/resource {string} on the webUI',
  async function(name, role, resource) {
    await findMatchingPublicLinkByName(name, role, resource)
  }
)

Then(
  'a link named {string} should be listed with role {string} in the public link list of file/folder/resource {string} via {string} on the webUI',
  async function(name, role, resource, via) {
    await findMatchingPublicLinkByName(name, role, resource, via)
  }
)

Then(
  'the user should see an error message on the public link share dialog saying {string}',
  async function(expectedMessage) {
    const actualMessage = await client.page.FilesPageElement.publicLinksDialog().getErrorMessage()
    return client.assert.strictEqual(actualMessage, expectedMessage)
  }
)

When(
  'the user copies the url of public link named {string} of file/folder/resource {string} using the webUI',
  async function(linkName, resource) {
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    return client.page.FilesPageElement.publicLinksDialog().copyPublicLinkURI(linkName)
  }
)

Then('the tokens should be unique for each public links on the webUI', async function() {
  const publicLinkUrls = await client.page.FilesPageElement.publicLinksDialog().getPublicLinkUrls()
  const isUnique = publicLinkUrls.length === new Set(publicLinkUrls).size
  return assert.ok(isUnique)
})

Then(
  'a public link with the last created link share token as name should be listed for resource {string} on the webUI',
  async function(resource) {
    const lastShare = await sharingHelper.fetchLastPublicLinkShare(client.globals.currentUser)
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    const shares = await client.page.FilesPageElement.publicLinksDialog().getPublicLinkList()
    const share = shares.find(link => link.name === lastShare.token)
    return assert.ok(share.name.length > 0)
  }
)

When(
  'the user creates a public link via quick action for resource {string} using the webUI',
  function(resource) {
    return client.page.FilesPageElement.filesList().useQuickAction(resource, 'public link')
  }
)
