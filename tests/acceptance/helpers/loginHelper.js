const { client, createSession, closeSession, startWebDriver, stopWebDriver } = require('nightwatch-api')
const userSettings = require('./userSettings')

module.exports = {
  loginAsUser: function (userId) {
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
        client.globals.currentUser = userId
      })
  },

  reLoginAsUser: async function (userId) {
    let env = 'local'
    if (process.env.DRONE) {
      env = 'drone'
    }
    await closeSession()
    await stopWebDriver()
    await startWebDriver({ env })
    await createSession({ env })
    return this.loginAsUser(userId)
  },

  logout: function (userId) {
    const phoenixPage = client.page.phoenixPage()
    return phoenixPage
      .navigate()
      .waitForElementVisible('@menuButton')
      .click('@menuButton')
      .waitForElementVisible('@logoutMenuItem')
      .waitForAnimationToFinish()
      .click('@logoutMenuItem')
  }
}
