const { client } = require('nightwatch-api')
const { When, Then } = require('@cucumber/cucumber')
const codify = require('../helpers/codify')
const assert = require('assert')

When('the user marks the notification as read', function () {
  return client.page.webPage().markNotificationAsRead()
})

When('the user accepts all shares displayed in the notifications on the webUI', function () {
  return client.page.webPage().acceptAllSharesInNotification()
})

When('the user declines all shares displayed in the notifications on the webUI', function () {
  return client.page.webPage().declineAllSharesInNotification()
})

Then('the user should see the notification bell on the webUI', function () {
  return client.page.webPage().waitForElementVisible('@notificationBell')
})

Then('the user should see the notification bell on the webUI after a page reload', function () {
  client.refresh()
  return client.page.webPage().waitForElementVisible('@notificationBell')
})

Then('the notification bell should disappear on the webUI', function () {
  return client.page.webPage().waitForElementNotPresent('@notificationBell')
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

Then('the user should have no notifications', async function () {
  const status = await client.page.webPage().isNotificationBellVisible()
  assert.ok(!status, 'Expected: notification bell to be absent but found: visible')
})

When(
  'the user follows the link of following share from notification using the webUI',
  function (dataTable) {
    const { resource, sharer } = dataTable.rowsHash()
    const linkSelector = client.page.webPage().getLinkSelectorFromNotification(resource, sharer)
    return client.page.webPage().toggleNotificationDrawer().followLink(linkSelector)
  }
)
