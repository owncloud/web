const { client } = require('nightwatch-api')
const { Given, Then, When } = require('cucumber')
const loginHelper = require('../helpers/loginHelper')

Given(/^the user has browsed to the login page$/,
  () => {
    return client
      .page
      .loginPage()
      .navigate()
  })

When('the user clicks the authenticate button',
  () => {
    const loginPage = client.page.loginPage()
    return loginPage
      .waitForElementVisible('@authenticateButton')
      .click('@authenticateButton')
  })

When('the user logs in with username {string} and password {string} using the webUI',
  (username, password) => {
    const loginPage = client.page.ownCloudLoginPage()
    return loginPage
      .waitForElementVisible('@usernameInput')
      .setValue('@usernameInput', username)
      .setValue('@passwordInput', password)
      .click('@loginSubmitButton')
  })

When('the user authorizes access to phoenix',
  () => {
    const loginPage = client
      .page.ownCloudAuthorizePage()
    return loginPage
      .waitForElementPresent('@authorizeButton')
      .click('@authorizeButton')
  })

Then('the files table should not be empty',
  () => {
    return client.page.FilesPageElement.filesList()
    // even the loading indicator is gone the table might not be rendered yet
      .waitForElementVisible('@fileRows')
  })

// combined step
Given('user {string} has logged in using the webUI', (user) => {
  return loginHelper.loginAsUser(user)
})

When('the user re-logs in as {string} using the webUI', (user) => {
  return loginHelper.reLoginAsUser(user)
})
