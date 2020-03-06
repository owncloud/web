const { client, createSession, closeSession, startWebDriver, stopWebDriver } = require('nightwatch-api')
const userSettings = require('./userSettings')

module.exports = {
  /**
   *
   * @param {userId} userId
   * @param {password} [password=null] - If not passed, default password for given `userId` will be used
   */
  loginAsUser: async function (userId, password = null) {
    await client.page.loginPage().navigate().authenticate()

    password = password || userSettings.getPasswordForUser(userId)
    if (client.globals.ocis) {
      await client.page.ocisLoginPage().login(userId, password)
      await client.page.kopanoAuthorizePage().authorize()
    } else {
      await client.page.ownCloudLoginPage().login(userId, password)
      await client.page.ownCloudAuthorizePage().authorize()
    }
    return client
      .page.phoenixPage()
      .waitForElementVisible('@appContainer')
      .then(() => {
        client.globals.currentUser = userId
      })
  },

  /**
   *
   * @param {string} userId
   */
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
      .waitForElementVisible('@userMenuButton')
      .click('@userMenuButton')
      .waitForElementVisible('@logoutMenuItem')
      .waitForAnimationToFinish()
      .click('@logoutMenuItem')
  }
}
