const { client } = require('nightwatch-api')
const { When, Then } = require('cucumber')
const fetch = require('node-fetch')
require('url-search-params-polyfill')
const httpHelper = require('../helpers/httpHelper')
const sharingHelper = require('../helpers/sharingHelper')
const assert = require('assert')

When(
  'the user creates a new public link for file/folder/resource {string} using the webUI',
  function (resource) {
    return client.page.FilesPageElement
      .sharingDialog()
      .closeSharingDialog(100)
      .openPublicLinkDialog(resource)
      .addNewLink()
  }
)

When('the public uses the webUI to access the last public link created by user {string}', async function (linkCreator) {
  const headers = httpHelper.createAuthHeader(linkCreator)
  const apiURL = client.globals.backend_url + '/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json'
  let lastShareToken = null
  await fetch(apiURL, { method: 'GET', headers: headers })
    .then(res => res.json())
    .then(function (sharesResult) {
      if (sharesResult.ocs.meta.statuscode === 200) {
        const shares = sharesResult.ocs.data
        let lastFoundShareId = 0
        for (var shareI = 0; shareI < shares.length; shareI++) {
          const share = shares[shareI]
          if (share.share_type === sharingHelper.SHARE_TYPES.public_link && share.id >= lastFoundShareId) {
            lastFoundShareId = share.id
            lastShareToken = share.token
          }
        }
        if (lastShareToken === null) {
          throw Error('Could not find public shares. All shares: ' + JSON.stringify(shares, null, 2))
        }
      } else {
        throw Error('Could not get shares. Message: ' + sharesResult.ocs.meta.message)
      }
    })
  return client.page.publicLinkFilesPage().navigateAndWaitTillLoaded(lastShareToken)
})

Then(
  'a link named {string} should be listed with role {string} in the public link list of file/folder/resource {string} on the webUI',
  function (name, role, resource) {
    return client.page.FilesPageElement
      .sharingDialog()
      .closeSharingDialog(100)
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
