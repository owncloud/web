const { client } = require('nightwatch-api')
const { Given, Then, When } = require('@cucumber/cucumber')
const loginHelper = require('../helpers/loginHelper')
const assert = require('assert')

Given(/^the user has browsed to the login page$/, () => {
  return client.page.loginPage().navigate()
})

Given('the user has clicked the authenticate button', () => client.page.loginPage().authenticate())

When('the user clicks the authenticate button', () => client.page.loginPage().authenticate())

When(
  'the user logs in with username {string} and password {string} using the webUI',
  (username, password) => {
    if (client.globals.openid_login) {
      return client.page.ocisLoginPage().login(username, password)
    }
    return client.page.ownCloudLoginPage().login(username, password)
  }
)

When(
  'the user tries to log in with username {string} and password {string} using the webUI',
  (username, password) => {
    if (client.globals.openid_login) {
      return client.page.ocisLoginPage().login(username, password, false)
    }
    return client.page.ownCloudLoginPage().login(username, password, false)
  }
)

When('user {string} logs in using the webUI', username => loginHelper.loginAsUser(username))

When('the user authorizes access to web', () => {
  return client.page.ownCloudAuthorizePage().authorize()
})

Then('the files table should not be empty', () => {
  return (
    client.page.FilesPageElement.filesList()
      // even when the loading indicator is gone the table might not be rendered yet
      .waitForElementVisible('@fileRow')
  )
})

Then('the warning {string} should be displayed on the login page', async function(expectedMessage) {
  let actualMessage
  if (client.globals.openid_login) {
    actualMessage = await client.page.ocisLoginPage().getLoginErrorMessage()
  } else {
    actualMessage = await client.page.ownCloudLoginPage().getLoginErrorMessage()
  }
  return assert.strictEqual(
    actualMessage,
    expectedMessage,
    `Error message miss-match, Expected: '${expectedMessage}', Found: '${actualMessage}'`
  )
})

Then('the user should be on page with the url containing {string}', function(urlContent) {
  return client.assert.urlContains(urlContent)
})

// combined step
Given('user {string} has logged in using the webUI', user => {
  return loginHelper.loginAsUser(user)
})

When('the user logs out of the webUI', () => {
  return loginHelper.logout()
})

When('the user re-logs in as {string} using the webUI', user => {
  return loginHelper.reLoginAsUser(user)
})

Then('the user profile should be visible on the webUI', function() {
  return client.page.webPage().waitForElementVisible('@userMenuButton')
})

When('the user opens the user profile', function() {
  return client.page.webPage().browseToUserProfile()
})

Then('username {string} should be visible on the webUI', async function(username) {
  const profileUserName = await client.page.profilePage().getUserProfileName()
  assert.strictEqual(profileUserName, username)
})

When('the user browses to manage the account', function() {
  return client.page.profilePage().browseToManageAccount()
})

Then('the accounts page should be visible on the webUI', async function() {
  const isPageVisible = await client.page.accountPage().isPageVisible()
  return assert.ok(isPageVisible)
})

Then('the user should be redirected to the login page', function() {
  return client.page.loginPage().waitForPage()
})

Then('the user should be redirected to the user disabled page', function() {
  return client.page.userDisabledPage().waitTillLoaded()
})

Then('the user should be redirected to the IdP login page', function() {
  if (client.globals.openid_login) {
    return client.page.ocisLoginPage().waitForPage()
  }

  return client.page.ownCloudAuthorizePage().waitForPage()
})

Then('the user should be redirected to the login error page', function() {
  return client.page.loginErrorPage().waitTillLoaded()
})

When('the user exits the login error page', function() {
  return client.page.loginErrorPage().exit()
})

Then('the user should be redirected to the owncloud login page', function() {
  return client.page.ownCloudLoginPage().waitTillLoaded()
})
