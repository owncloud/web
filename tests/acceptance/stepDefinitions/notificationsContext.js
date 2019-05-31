const { client } = require('nightwatch-api')
const { When, Then } = require('cucumber')
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

Then('the user should see the notification bell on the webUI after a page reload', function () {
  client.refresh()
  return client.page.phoenixPage().waitForElementVisible('@notificationBell')
})

Then('the notification bell should dissapear on the webUI', function () {
  return client.page.phoenixPage().waitForElementNotPresent('@notificationBell')
})
