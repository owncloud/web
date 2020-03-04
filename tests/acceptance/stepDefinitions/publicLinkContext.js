const { client } = require('nightwatch-api')
const { When, Then } = require('cucumber')
require('url-search-params-polyfill')
const sharingHelper = require('../helpers/sharingHelper')
const assert = require('assert')
const { SHARE_TYPES } = require('../helpers/sharingHelper')
const path = require('../helpers/path')

When(
  'the user (tries to )create/creates a new public link for file/folder/resource {string} using the webUI',
  async function (resource) {
    await client.page.FilesPageElement
      .appSideBar()
      .closeSidebar(100)
      .openPublicLinkDialog(resource)
    return client.page.FilesPageElement.publicLinksDialog()
      .addNewLink()
  }
)

When(
  'the user (tries to )create/creates a new public link for file/folder/resource {string} using the webUI with',
  async function (resource, settingsTable) {
    const settings = settingsTable.rowsHash()
    await client.page.FilesPageElement
      .appSideBar()
      .closeSidebar(100)
      .openPublicLinkDialog(resource)
    return client.page.FilesPageElement.publicLinksDialog().addNewLink(settings)
  }
)

When('the public uses the webUI to access the last public link created by user {string}', async function (linkCreator) {
  const lastShare = await sharingHelper.fetchLastPublicLinkShare(linkCreator)
  if (lastShare.permissions === sharingHelper.PERMISSION_TYPES.create) {
    return client.page.filesDropPage().navigateAndWaitTillLoaded(lastShare.token)
  }
  return client.page.publicLinkFilesPage().navigateAndWaitTillLoaded(lastShare.token)
})

When('the public (tries to )open/opens the public link page of the last public link created by user {string}', async function (linkCreator) {
  const lastShare = await sharingHelper.fetchLastPublicLinkShare(linkCreator)
  return client.page.publicLinkFilesPage().navigateAndWaitTillLoaded(lastShare.token)
})

When('the public (tries to )open/opens the public link page of the last public link created by user {string} with password {string}', async function (linkCreator, password) {
  const lastShare = await sharingHelper.fetchLastPublicLinkShare(linkCreator)
  await client.page.publicLinkFilesPage().navigateAndWaitForPasswordPage(lastShare.token)
  return client.page.publicLinkPasswordPage().submitPublicLinkPassword(password)
})

When('the public uses the webUI to access the last public link created by user {string} with password {string}', async function (linkCreator, password) {
  const lastShare = await sharingHelper.fetchLastPublicLinkShare(linkCreator)
  if (lastShare.permissions === sharingHelper.PERMISSION_TYPES.create) {
    await client.page.filesDropPage().navigateAndWaitForPasswordPage(lastShare.token)
  } else {
    await client.page.publicLinkFilesPage().navigateAndWaitForPasswordPage(lastShare.token)
  }
  return client.page.publicLinkPasswordPage().submitPublicLinkPassword(password)
})

Then('user {string} should not have any public link',
  async function (sharer) {
    const resp = await sharingHelper.getAllPublicLinkShares(sharer)
    assert.strictEqual(
      resp.length, 0, 'User has shares. Response: ' + resp)
  })

Then('the fields of the last public link share response of user {string} should include',
  function (linkCreator, dataTable) {
    const fieldsData = dataTable.rowsHash()
    return sharingHelper.assertUserLastPublicShareDetails(linkCreator, fieldsData)
  })

Then('as user {string} the folder {string} should not have any public link', async function (sharer, resource) {
  const publicLinkShares = await sharingHelper.getAllPublicLinkShares(sharer)
  resource = path.resolve(resource)
  for (const share of publicLinkShares) {
    if (share.path === resource && share.share_type === SHARE_TYPES.public_link) {
      assert.fail(
        'Expected share with user ' + sharer +
        ' and resource ' + resource + ' is present!\n' + JSON.stringify(publicLinkShares)
      )
    }
  }
  return this
})

Then('the public should not get access to the publicly shared file', async function () {
  const message = await client
    .page
    .publicLinkPasswordPage()
    .submitLinkPasswordForm() // form is submitted as password input is filled in the step before this particular step in 'when' part
    .getResourceAccessDeniedMsg()
  return assert.strictEqual(
    'This resource is password-protected.',
    message,
    'Resource protected message invalid, Found: ', message
  )
})

When('the user edits the public link named {string} of file/folder/resource {string} changing following but not saving',
  async function (linkName, resource, dataTable) {
    const editData = dataTable.rowsHash()
    await client.page.FilesPageElement
      .appSideBar()
      .closeSidebar(100)
      .openPublicLinkDialog(resource)
    return client.page.FilesPageElement
      .publicLinksDialog()
      .editPublicLink(linkName, editData)
  })

When('the user edits the public link named {string} of file/folder/resource {string} changing following',
  async function (linkName, resource, dataTable) {
    const editData = dataTable.rowsHash()
    await client.page.FilesPageElement
      .appSideBar()
      .closeSidebar(100)
      .openPublicLinkDialog(resource)
    await client.page.FilesPageElement
      .publicLinksDialog()
      .editPublicLink(linkName, editData)
    return client.page.FilesPageElement
      .publicLinksDialog()
      .savePublicLink()
  })

When('the user tries to edit expiration of the public link named {string} of file {string} to past date {string}',
  async function (linkName, resource, pastDate) {
    await client.page.FilesPageElement
      .appSideBar()
      .closeSidebar(100)
      .openPublicLinkDialog(resource)
    await client.page.FilesPageElement.publicLinksDialog().clickLinkEditBtn(linkName)
    const isDisabled = await client.page.FilesPageElement
      .publicLinksDatePicker()
      .isExpiryDateDisabled(pastDate)
    return assert.ok(
      isDisabled,
      'Expected expiration date to be disabled but found not disabled'
    )
  })

When('the user removes the public link named {string} of file/folder/resource {string} using the webUI',
  async function (linkName, resource) {
    await client.page
      .FilesPageElement
      .appSideBar()
      .closeSidebar(100)
      .openPublicLinkDialog(resource)
    return client.page.FilesPageElement.publicLinksDialog()
      .removePublicLink(linkName)
  })

Then('public link named {string} should not be listed on the public links list on the webUI', async function (linkName) {
  const isPresent = await client.page
    .FilesPageElement
    .publicLinksDialog()
    .isPublicLinkPresent(linkName)
  return assert.ok(
    !isPresent,
    `expected public-link '${linkName}' to be 'not listed' but got found`
  )
})

async function findMatchingPublicLinkByName (name, role, resource, via = null) {
  await client.page.FilesPageElement
    .appSideBar()
    .closeSidebar(100)
    .openPublicLinkDialog(resource)

  const shares = await client.page.FilesPageElement
    .publicLinksDialog()
    .getPublicLinkList()

  const share = shares.find(link => link.name === name)

  if (!share) {
    assert.fail(
      `Link with name "${name}" was expected to be in share list but was not present. Found links: ` + shares.map(share => share.name)
    )
  }

  assert.strictEqual(role, share.role)
  if (via !== null) {
    assert.strictEqual('Via ' + via, share.viaLabel)
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

Then('the user should see an error message on the public link share dialog saying {string}', async function (expectedMessage) {
  const actualMessage = await client.page.FilesPageElement
    .publicLinksDialog()
    .getErrorMessage()
  return client.assert.strictEqual(actualMessage, expectedMessage)
})

When('the user closes the public link details sidebar', function () {
  return client.page.FilesPageElement
    .appSideBar()
    .closeSidebar(100)
})

When('the user copies the url of public link named {string} of file/folder/resource {string} using the webUI',
  async function (linkName, resource) {
    await client.page.FilesPageElement
      .appSideBar()
      .closeSidebar(100)
      .openPublicLinkDialog(resource)
    return client.page.FilesPageElement.publicLinksDialog()
      .copyPublicLinkURI(linkName)
  })

Then('the tokens should be unique for each public links on the webUI', async function () {
  const publicLinkUrls = await client.page.FilesPageElement.publicLinksDialog().getPublicLinkUrls()
  const isUnique = publicLinkUrls.length === (new Set(publicLinkUrls).size)
  return assert.ok(isUnique)
})
