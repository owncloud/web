module.exports = {
  commands: {
    /**
     * creates a new public link
     * @returns {*}
     */
    addNewLink: async function (role = null) {
      const addLinkButtonXpath = this.elements.publicLinkContainer.selector + this.elements.addLinkButton.selector
      const createLinkButtonXpath = this.elements.publicLinkContainer.selector + this.elements.createLinkButton.selector
      this
        .click({ locateStrategy: 'xpath', selector: addLinkButtonXpath })
        .waitForElementVisible({ locateStrategy: 'xpath', selector: createLinkButtonXpath })

      if (role !== null) {
        const util = require('util')
        const roleSelectorXpath = util.format(this.elements.roleButton.selector, role)
        await this.click({ locateStrategy: 'xpath', selector: roleSelectorXpath })
      }

      return this.click({ locateStrategy: 'xpath', selector: createLinkButtonXpath })
        .waitForOutstandingAjaxCalls()
        .waitForElementNotPresent({ locateStrategy: 'xpath', selector: createLinkButtonXpath, abortOnFailure: false })
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
    },
    /**
     *
     * @returns {Promise<string>}
     */
    getErrorMessage: async function () {
      let result
      await this.getText(
        'xpath',
        this.elements.publicLinkContainer.selector + this.elements.errorMessageInsidePublicLinkContainer.selector,
        function (textValue) {
          result = textValue.value
        }
      )
      return result
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
    },
    roleButton: {
      selector: '//*[contains(@class,"oc-files-file-link-form")]//*[.="%s"]'
    },
    errorMessageInsidePublicLinkContainer: {
      selector: '//div[contains(@class, "uk-alert-danger")]',
      locateStrategy: 'xpath'
    }
  }
}
