const { client } = require('nightwatch-api')
const { Given, Then, When } = require('cucumber')
// respect custom credentials via env vars
const OC_USER = process.env.OC_USER || null
const OC_PASS = process.env.OC_PASS || null

Given(/^the user has browsed to the login page$/,
  () => {
    const loginPage = client.page.loginPage()
    return loginPage
      .navigate()
  })

When('the user clicks the authenticate button',
  () => {
    const loginPage = client.page.loginPage()
    return loginPage
      .waitForElementVisible('@authenticateButton')
      .click('@authenticateButton')
  })

Then('the user logs in with username {string} and password {string} using the webUI',
  (username, password) => {
    const loginPage = client.page.ownCloudLoginPage()
    return loginPage
      .waitForElementVisible('@usernameInput', client.SHORT_WAIT_TIME)
      .setValue('@usernameInput', OC_USER || username)
      .setValue('@passwordInput', OC_PASS || password)
      .click('@loginSubmitButton')
  })

When('the user authorizes access to phoenix',
  () => {
    const loginPage = client
      .page.ownCloudAuthorizePage()
    return loginPage
      .waitForElementPresent('@authorizeButton', client.SHORT_WAIT_TIME)
      .click('@authorizeButton')
  })

Then('the files table should be displayed',
  () => {
    const filesPage = client.page.filesPage()
    return filesPage
      .waitForElementVisible('@filesTable', client.LONGER_WAIT_TIME)
  })

Then('the files table should not be empty',
  () => {
    const filesPage = client.page.filesPage()
    return filesPage
    // even the loading indicator is gone the table might not be rendered yet
      .waitForElementVisible('@fileRows', client.LONG_WAIT_TIME)
  })
