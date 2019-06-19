module.exports = {
  url: function () {
    return this.api.launchUrl + '/#/'
  },
  commands: {
    /**
     *
     * @param {string} searchTerm
     */
    search: function (searchTerm) {
      return this.waitForElementVisible('@searchInputField')
        .initAjaxCounters()
        .setValue('@searchInputField', [searchTerm, this.api.Keys.ENTER])
        .waitForElementNotVisible('@searchLoadingIndicator')
        .waitForOutstandingAjaxCalls()
    },
    openCoreMenu: function () {
      return this.waitForElementVisible('@coreMenuOpenButton')
        .click('@coreMenuOpenButton')
        .waitForElementVisible('@coreMenu')
        .waitForAnimationToFinish()
    }
  },
  elements: {
    message: {
      selector: '//*[contains(@class, "uk-notification-message")]/div/div[contains(@class, "oc-notification-message-title")]',
      locateStrategy: 'xpath'
    },
    ocDialogPromptAlert: {
      selector: '#oc-dialog-prompt-alert'
    },
    searchInputField: {
      selector: '.oc-search-input'
    },
    searchLoadingIndicator: {
      selector: '.oc-app-bar .uk-spinner'
    },
    coreMenuOpenButton: {
      selector: '//header//button[@aria-label="Files"]',
      locateStrategy: 'xpath'
    },
    coreMenu: {
      selector: '#coreMenu'
    }
  }
}
