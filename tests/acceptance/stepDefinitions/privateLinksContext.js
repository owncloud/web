const { client } = require('nightwatch-api')
const { When } = require('cucumber')
const webdav = require('../helpers/webdavHelper')

When(
  'the user copies the private link of the file/folder/resource {string} using the webUI',
  async function(resource) {
    await client.page.FilesPageElement.filesList().openPublicLinkDialog(resource)
    return client.page.FilesPageElement.publicLinksDialog().copyPrivateLink()
  }
)

When('the user navigates to the copied private/public link using the webUI', async function() {
  let url
  await client.getClipBoardContent(u => {
    url = u
  })
  return await client
    .url(url)
    .page.FilesPageElement.filesList()
    .waitForElementVisible('@anyAfterLoading')
})

When(
  'the user navigates to the private link created by user {string} for file/folder {string}',
  async function(user, resource) {
    const item = await webdav.getProperties(resource, user, ['oc:privatelink'])
    return client
      .url(item['oc:privatelink'])
      .page.webPage()
      .waitForElementVisible('@webContainer')
  }
)

When('the private link resolved successfully', async function() {
  return await client.page.FilesPageElement.filesList().waitForElementVisible('@anyAfterLoading')
})

When(
  'an anonymous user tries to navigate to the private link created by user {string} for file/folder {string}',
  async function(user, resource) {
    const item = await webdav.getProperties(resource, user, ['oc:privatelink'])
    return await client
      .url(item['oc:privatelink'])
      .page.webPage()
      .waitForElementNotPresent('@webContainer')
  }
)
