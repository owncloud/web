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
  loginAsUser: async function(userId, password = null) {
    if (process.env.WEB_TOKEN && process.env.WEB_STATE) {
      await client.url(client.globals.backend_url)
      await client.execute(
        function(backendUrl, token, state) {
          sessionStorage.setItem('webStateInSessionStorage', JSON.parse(state))
          sessionStorage.setItem(`oc_oAuthuser:${backendUrl}:web`, JSON.parse(token))
        },
        [client.globals.backend_url, process.env.WEB_TOKEN, process.env.WEB_STATE],
        function(result) {
          console.log(result)
        }
      )
      await client.page.personalPage().navigateAndWaitTillLoaded()
    } else {
      await client.page.loginPage().navigate()
      password = password || userSettings.getPasswordForUser(userId)
      if (client.globals.openid_login) {
        await client.page.ocisLoginPage().login(userId, password)
      } else {
        await client.page.ownCloudLoginPage().login(userId, password)
        await client.page.ownCloudAuthorizePage().authorize()
      }
      await client.page
        .webPage()
        .waitForElementVisible('@appContainer')
        .then(() => {
          client.globals.currentUser = userId
        })
      await client.execute(
        function(backendUrl) {
          return sessionStorage.getItem(`oc_oAuthuser:${backendUrl}:web`)
        },
        [client.globals.backend_url],
        function(result) {
          process.env.WEB_TOKEN = JSON.stringify(result.value)
        }
      )
      await client.execute(
        function() {
          return sessionStorage.getItem('webStateInSessionStorage')
        },
        [],
        function(result) {
          process.env.WEB_STATE = JSON.stringify(result.value)
        }
      )
    }
  },

  /**
   *
   * Destroy and start a new browser session
   */
  startNewSession: async function() {
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
  reLoginAsUser: async function(userId) {
    await this.startNewSession()
    return this.loginAsUser(userId)
  },

  logout: function(userId) {
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
