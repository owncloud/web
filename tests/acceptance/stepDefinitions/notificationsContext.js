const { client } = require('nightwatch-api')
const { Given, When, Then } = require('cucumber')
const httpHelper = require('../helpers/httpHelper')
const fetch = require('node-fetch')

When('user {string} is sent a notification', function (user) {
  const body = new URLSearchParams()
  body.append('user', user)

  return fetch(
    client.globals.backend_url + '/ocs/v2.php/apps/testing/api/v1/notifications',
    { method: 'POST', headers: httpHelper.createAuthHeader(user), body: body }
  )
    .then(res => httpHelper.checkStatus(res, 'Could not generate notification.'))
})

When('the user marks the notification as read', function () {
  return client.page.phoenixPage().markNotificationAsRead()
})

Given('app {string} has been enabled', function (app) {
  const headers = httpHelper.createAuthHeader('admin')
  return fetch(client.globals.backend_url + '/ocs/v2.php/cloud/apps/' + app + '?format=json', {
    headers,
    body: {},
    method: 'POST'
  }).then(res => {
    httpHelper.checkStatus(res, 'Failed while trying to enable the app')
    return res.json()
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

Then('the user should see {int} notifications on the webUI with these details', function (numberOfNotifications, dataTable) {
  const dataTableHashed = dataTable.hashes()
  return client.page.phoenixPage().assertNotificationIsPresent(numberOfNotifications, dataTableHashed)
})
