const { client } = require('nightwatch-api')
const { Given, When, Then } = require('cucumber')
const httpHelper = require('../helpers/httpHelper')
const codify = require('../helpers/codify')
const fetch = require('node-fetch')
const assert = require('assert')
const util = require('util')
const { join } = require('../helpers/path')

When('user {string} is sent a notification', function (user) {
  const body = new URLSearchParams()
  body.append('user', user)
  const apiURL = join(client.globals.backend_url, '/ocs/v2.php/apps/testing/api/v1/notifications')

  return fetch(apiURL,
    { method: 'POST', headers: httpHelper.createAuthHeader(user), body: body }
  )
    .then(res => httpHelper.checkStatus(res, 'Could not generate notification.'))
})

When('the user marks the notification as read', function () {
  return client.page.phoenixPage().markNotificationAsRead()
})

When('the user accepts all shares displayed in the notifications on the webUI', function () {
  return client.page.phoenixPage().acceptAllSharesInNotification()
})

When('the user declines all shares displayed in the notifications on the webUI', function () {
  return client.page.phoenixPage().declineAllSharesInNotification()
})

Given('app {string} has been {}', function (app, action) {
  assert.ok(
    action === 'enabled' || action === 'disabled',
    "only supported either 'enabled' or 'disabled'. Passed: " + action
  )
  const headers = httpHelper.createAuthHeader('admin')
  const method = action === 'enabled' ? 'POST' : 'DELETE'

  const errorMessage = util.format(
    'Failed while trying to %s the app',
    action === 'enabled' ? 'enable' : 'disable'
  )
  const apiURL = join(client.globals.backend_url, '/ocs/v2.php/cloud/apps/', app, '?format=json')
  return fetch(apiURL, {
    headers,
    method
  }).then(res => {
    httpHelper.checkStatus(res, errorMessage)
    return res.json()
  }).then(data => {
    httpHelper.checkOCSStatus(data, errorMessage)
  })
})

Then('the user should see the notification bell on the webUI', function () {
  return client.page.phoenixPage().waitForElementVisible('@notificationBell')
})

Then('the user should see the notification bell on the webUI after a page reload', function () {
  client.refresh()
  return client.page.phoenixPage().waitForElementVisible('@notificationBell')
})

Then('the notification bell should disappear on the webUI', function () {
  return client.page.phoenixPage().waitForElementNotPresent('@notificationBell')
})

Then('the user should see {int} notifications on the webUI with these details',
  async function (numberOfNotifications, dataTable) {
    codify.replaceInlineTable(dataTable)
    const expectedNotifications = dataTable.hashes()
    const notifications = await client.page.phoenixPage().getNotifications()
    assert.strictEqual(
      notifications.length,
      numberOfNotifications,
      'Notification count miss-match!'
    )
    for (const element of expectedNotifications) {
      const isPresent = notifications.includes(element.title)
      assert.ok(
        isPresent,
        `Expected: '${element.title}' to be present but found: not present in ${notifications}`)
    }
  })

Then('the user should have no notifications', async function () {
  const status = await client.page.phoenixPage().isNotificationBellVisible()
  assert.ok(!status, 'Expected: notification bell to be absent but found: visible')
})
