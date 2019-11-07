const { client } = require('nightwatch-api')
const { When, Then } = require('cucumber')
require('url-search-params-polyfill')
const sharingHelper = require('../helpers/sharingHelper')
const assert = require('assert')

When(
  'the user creates a new public link for file/folder/resource {string} using the webUI',
  function (resource) {
    return client.page.FilesPageElement
      .filesList()
      .closeSidebar(100)
      .openPublicLinkDialog(resource)
      .addNewLink()
  }
)

When(
  'the user creates a new public link for file/folder/resource {string} using the webUI with',
  function (resource, settingsTable) {
    const settings = settingsTable.rowsHash()
    return client.page.FilesPageElement
      .filesList()
      .closeSidebar(100)
      .openPublicLinkDialog(resource)
      .addNewLink(settings.role)
  }
)

When('the public uses the webUI to access the last public link created by user {string}', async function (linkCreator) {
  const lastShareToken = await sharingHelper.fetchLastPublicLinkShare(linkCreator)
  return client.page.publicLinkFilesPage().navigateAndWaitTillLoaded(lastShareToken)
})

When('the public uses the webUI to access the last public link created by user {string} with password {string}', async function (linkCreator, password) {
  const lastShareToken = await sharingHelper.fetchLastPublicLinkShare(linkCreator)
  await client.page.publicLinkFilesPage().navigateAndWaitForPasswordPage(lastShareToken)

  return client.page.publicLinkPasswordPage().submitPublicLinkPassword(password)
})

Then(
  'a link named {string} should be listed with role {string} in the public link list of file/folder/resource {string} on the webUI',
  function (name, role, resource) {
    return client.page.FilesPageElement
      .filesList()
      .closeSidebar(100)
      .openPublicLinkDialog(resource)
      .getPublicLinkList()
      .then(links => {
        const searchregex = new RegExp(name + '\n.*' + role)
        let found = false
        for (const link of links) {
          if (searchregex.test(link) === true) {
            found = true
            break
          }
        }
        assert.strictEqual(
          found, true,
          `could not find public link named "${name}" with role "${role}"`
        )
      })
  })
