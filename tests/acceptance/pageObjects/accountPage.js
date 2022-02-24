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
     * Gets the account information details from the account information element on the account page
     *
     * @returns {object}
     */
    getAccountInformation: async function () {
      const accountInformation = []
      let accountInfoElementIds = []
      await this.waitForElementVisible('@accountInformationElements').api.elements(
        '@accountInformationElements',
        function (result) {
          accountInfoElementIds = result.value
        }
      )
      for (const elementIdIndex in accountInfoElementIds) {
        await this.api.elementIdText(
          accountInfoElementIds[elementIdIndex].ELEMENT,
          function (elementText) {
            accountInformation.push(elementText.value)
          }
        )
      }
      const actualAccInfo = {}
      for (const elem of accountInformation) {
        if (elem.indexOf('\n') < 0) {
          continue
        }
        const s = elem.split('\n')
        actualAccInfo[s[0].trim()] = s[1].trim()
      }
      return actualAccInfo
    },
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
    },
    accountInformationElements: {
      selector: '//dt[contains(@class, "account-page-info-")]',
      locateStrategy: 'xpath'
    }
  }
}
