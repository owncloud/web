module.exports = {
  commands: {
    /**
     * creates a new public link
     * @returns {*}
     */
    addNewLink: function () {
      const addLinkButtonXpath = this.elements.publicLinkContainer.selector + this.elements.addLinkButton.selector
      const createLinkButtonXpath = this.elements.publicLinkContainer.selector + this.elements.createLinkButton.selector
      return this
        .click({ locateStrategy: 'xpath', selector: addLinkButtonXpath })
        .waitForElementVisible({ locateStrategy: 'xpath', selector: createLinkButtonXpath })
        .click({ locateStrategy: 'xpath', selector: createLinkButtonXpath })
        .waitForOutstandingAjaxCalls()
        .waitForElementNotPresent({ locateStrategy: 'xpath', selector: createLinkButtonXpath })
    },
    /**
     * gets the text of all public links of the currently open public link tab
     *
     * @returns {Promise<string[]>}
     */
    getPublicLinkList: async function () {
      const promiseList = []
      const publicLinkInfoXpath = this.elements.publicLinkContainer.selector + this.elements.publicLinkInformation.selector
      await this.initAjaxCounters()
        .waitForElementPresent({ locateStrategy: 'xpath', selector: publicLinkInfoXpath, abortOnFailure: false })
        .waitForOutstandingAjaxCalls()
        .api.elements('xpath', publicLinkInfoXpath, result => {
          result.value.map(item => {
            promiseList.push(new Promise((resolve) => {
              this.api.elementIdText(item.ELEMENT, text => {
                resolve(text.value)
              })
            })
            )
          })
        })
      return Promise.all(promiseList)
    }
  },
  elements: {
    publicLinkContainer: {
      selector: '//*[@id="oc-files-file-link"]',
      locateStrategy: 'xpath'
    },
    publicLinkInformation: {
      selector: '//li',
      locateStrategy: 'xpath'
    },
    addLinkButton: {
      selector: '//button[contains(.,"Add Link")]',
      locateStrategy: 'xpath'
    },
    createLinkButton: {
      selector: '//button[contains(.,"Create")]',
      locateStrategy: 'xpath'
    }
  }
}
