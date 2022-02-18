const {
  client,
  createSession,
  closeSession,
  startWebDriver,
  stopWebDriver
} = require('nightwatch-api')
const userSettings = require('./userSettings')

module.exports = {
  /**
   *
   * @param {userId} userId
   * @param {password} [password=null] - If not passed, default password for given `userId` will be used
   */
  loginAsUser: async function (userId, password = null) {
    await client.page.loginPage().navigate()

    password = password || userSettings.getPasswordForUser(userId)
    if (client.globals.openid_login) {
      await client.page.ocisLoginPage().login(userId, password)
    } else {
      await client.page.ownCloudLoginPage().login(userId, password)
    }
    await client.page
      .webPage()
      .waitForElementVisible('@appContainer')
      .then(() => {
        client.globals.currentUser = userId
      })
  },

  /**
   *
   * Destroy and start a new browser session
   */
  startNewSession: async function () {
    let env = 'local'
    if (process.env.DRONE) {
      env = 'drone'
    }
    await closeSession()
    await stopWebDriver()
    await startWebDriver({ env })
    await createSession({ env })
    await client.windowMaximize()
  },

  /**
   *
   * @param {string} userId
   */
  reLoginAsUser: async function (userId) {
    await this.startNewSession()
    return this.loginAsUser(userId)
  },

  logout: function (userId) {
    const webPage = client.page.webPage()
    return webPage
      .navigate()
      .waitForElementVisible('@userMenuButton')
      .click('@userMenuButton')
      .waitForElementVisible('@logoutMenuItem')
      .waitForAnimationToFinish()
      .click('@logoutMenuItem')
  }
}
