const { client } = require('nightwatch-api')
const { When, Then } = require('@cucumber/cucumber')
const codify = require('../helpers/codify')
const assert = require('assert')

When('the user accepts all shares displayed in the notifications on the webUI', function () {
  return client.page.webPage().acceptAllSharesInNotification()
})

When('the user declines all shares displayed in the notifications on the webUI', function () {
  return client.page.webPage().declineAllSharesInNotification()
})

Then(
  'the user should see {int} notifications on the webUI with these details',
  async function (numberOfNotifications, dataTable) {
    codify.replaceInlineTable(dataTable)
    const expectedNotifications = dataTable.hashes()
    const notifications = await client.page.webPage().getNotifications()
    assert.strictEqual(
      notifications.length,
      numberOfNotifications,
      'Notification count miss-match!'
    )
    for (const element of expectedNotifications) {
      const isPresent = notifications.includes(element.title)
      assert.ok(
        isPresent,
        `Expected: '${element.title}' to be present but found: not present in ${notifications}`
      )
    }
  }
)
