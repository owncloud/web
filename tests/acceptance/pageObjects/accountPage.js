module.exports = {
  url: function () {
    return this.api.launchUrl + '/index.html#/account/'
  },
  commands: {
    /**
     * like build-in navigate() but also waits for the account display element
     * @returns {Promise}
     */
    navigateAndWaitTillLoaded: function () {
      return this.navigate(this.url())
        .waitForElementVisible('@accountDisplay')
    },

    /**
     * Gets the account information details from the account information element on the account page
     *
     * @returns {object}
     */
    getAccountInformation: async function () {
      const accountInformation = []
      let accountInfoElementIds = []
      await this.waitForElementVisible('@accountInformationElements')
        .api.elements('@accountInformationElements', function (result) {
          accountInfoElementIds = result.value
        })
      for (const elementIdIndex in accountInfoElementIds) {
        await this.api.elementIdText(accountInfoElementIds[elementIdIndex].ELEMENT, function (elementText) {
          accountInformation.push(elementText.value)
        })
      }
      const actualAccInfo = {}
      for (const elem of accountInformation) {
        const key = elem.substring(0, elem.lastIndexOf(':'))
        const value = elem.substring(elem.lastIndexOf('\n') + 1)
        actualAccInfo[key] = value
      }
      return actualAccInfo
    }
  },
  elements: {
    accountDisplay: {
      selector: '//div//span[@data-msgid="Account"]',
      locateStrategy: 'xpath'
    },
    accountInformationElements: {
      selector: '//div/span[.="Account Information"]/../../div[@class="uk-flex uk-flex-wrap"]/div',
      locateStrategy: 'xpath'
    }
  }
}
