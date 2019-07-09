const { client, createSession, closeSession, startWebDriver, stopWebDriver } = require('nightwatch-api')
const { Given, Then, When } = require('cucumber')
const userSettings = require('../helpers/userSettings')

const loginAsUser = function (userId) {
  const loginPage = client.page.loginPage()
  // Given the user has browsed to the login page
  loginPage
    .navigate()

  // When the user clicks the authenticate button
  loginPage
    .waitForElementVisible('@authenticateButton')
    .click('@authenticateButton')

  const password = userSettings.getPasswordForUser(userId)
  // Then the user logs in with username {string} and password {string} using the webUi
  const ocLoginPage = client.page.ownCloudLoginPage()
  ocLoginPage
    .waitForElementVisible('@usernameInput')
    .setValue('@usernameInput', userId)
    .setValue('@passwordInput', password)
    .click('@loginSubmitButton')

  // When the user authorizes access to phoenix
  client
    .page.ownCloudAuthorizePage()
    .waitForElementVisible('@authorizeButton')
    .click('@authorizeButton')
    .waitForElementNotPresent({
      selector: '@authorizeButton',
      abortOnFailure: false
    }, (result) => {
      if (result.value.length > 0) {
        // click failed
        console.log('WARNING: looks like I\'m still on auth page. ' +
                    'I will click the auth button again')
        client.page.ownCloudAuthorizePage()
          .click('@authorizeButton')
          .waitForElementNotPresent('@authorizeButton')
      }
    })

  // Then the files table should be displayed
  return client
    .page.FilesPageElement.filesList()
    .waitForElementVisible('@filesTable')
    .then(() => {
      client.globals.currentUserName = userSettings.getDisplayNameForUser(userId)
      client.globals.currentUser = userId
    })
}

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
Given('user {string} has logged in using the webUI', loginAsUser)

When('the user re-logs in as {string} using the webUI', async function (userId) {
  let env = 'local'
  if (process.env.DRONE) {
    env = 'drone'
  }
  await closeSession()
  await stopWebDriver()
  await startWebDriver({ env })
  await createSession({ env })
  return loginAsUser(userId)
})
