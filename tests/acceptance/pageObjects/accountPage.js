const { join } = require('../helpers/path')

module.exports = {
  url: function () {
    return join(this.api.launchUrl, '/account/')
  },
  commands: {
    /**
     * like build-in navigate() but also waits for the account display element
     * @returns {Promise}
     */
    navigateAndWaitTillLoaded: function () {
      return this.navigate(this.url()).waitForElementVisible('@accountDisplay')
    },
    /**
     * return the visibility of the account display element
     * @returns {Promise<boolean>}
     */
    isPageVisible: async function () {
      let isVisible = true

      await this.api.element('@accountDisplay', (result) => {
        isVisible = Object.keys(result.value).length > 0
      })

      return isVisible
    }
  },
  elements: {
    accountDisplay: {
      selector: '#account-page-title'
    }
  }
}
