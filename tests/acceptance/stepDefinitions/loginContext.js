const { client } = require('nightwatch-api')
const { Given, Then, When } = require('cucumber')
const loginHelper = require('../helpers/loginHelper')
const assert = require('assert')

Given(/^the user has browsed to the login page$/,
  () => {
    return client
      .page
      .loginPage()
      .navigate()
  })

Given('the user has clicked the authenticate button', () => client.page.loginPage().authenticate())

When('the user clicks the authenticate button', () => client.page.loginPage().authenticate())

When('the user logs in with username {string} and password {string} using the webUI',
  (username, password) => {
    if (client.globals.ocis) {
      return client.page.ocisLoginPage().login(username, password)
    }
    return client.page.ownCloudLoginPage().login(username, password)
  }
)

When('the user tries to log in with username {string} and password {string} using the webUI',
  (username, password) => {
    if (client.globals.ocis) {
      return client.page.ocisLoginPage().login(username, password)
    }
    return client.page.ownCloudLoginPage().login(username, password)
  }
)

When('user {string} logs in using the webUI',
  (username) => loginHelper.loginAsUser(username)
)

When('the user authorizes access to phoenix',
  () => {
    return client
      .page.ownCloudAuthorizePage()
      .authorize()
  })

Then('the files table should not be empty',
  () => {
    return client.page.FilesPageElement.filesList()
      // even the loading indicator is gone the table might not be rendered yet
      .waitForElementVisible('@fileRows')
  })

Then('the warning {string} should be displayed on the login page', async function (expectedMessage) {
  const actualMessage = await client.page.ownCloudLoginPage().getLoginErrorMessage()
  return assert.strictEqual(
    actualMessage, expectedMessage, `Error message miss-match, Expected: '${expectedMessage}', Found: '${actualMessage}'`
  )
})

Then('the authentication page should be visible',
  () => {
    const loginPage = client
      .page.loginPage()
    return loginPage
      .waitForElementPresent('@authenticateButton')
  })

// combined step
Given('user {string} has logged in using the webUI', (user) => {
  return loginHelper.loginAsUser(user)
})

When('the user logs out of the webUI', () => {
  return loginHelper.logout()
})

When('the user re-logs in as {string} using the webUI', (user) => {
  return loginHelper.reLoginAsUser(user)
})

Then('the user profile should be visible in the webUI', function () {
  return client.page.phoenixPage().waitForElementVisible('@userMenuButton')
})

When('the user opens the user profile', function () {
  return client.page.phoenixPage().browseToUserProfile()
})

Then('username {string} should be visible in the webUI', async function (username) {
  const profileUserName = await client.page.profilePage().getUserProfileName()
  assert.strictEqual(profileUserName, username)
})

When('the user browses to manage the account', function () {
  return client.page.profilePage().browseToManageAccount()
})

Then('the accounts page should be visible in the webUI', async function () {
  const isPageVisible = await client.page.accountPage().isPageVisible()
  return assert.ok(isPageVisible)
})
