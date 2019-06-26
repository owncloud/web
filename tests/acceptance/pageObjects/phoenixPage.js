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
      return this
        .initAjaxCounters()
        .isVisible('#files-open-search-btn', (result) => {
          if (result.value === true) {
            this
              .click('#files-open-search-btn')
              .waitForElementVisible('@searchInputFieldLowResolution')
              .setValue('@searchInputFieldLowResolution', [searchTerm, this.api.Keys.ENTER])
          } else {
            this
              .waitForElementVisible('@searchInputFieldHighResolution')
              .setValue('@searchInputFieldHighResolution', [searchTerm, this.api.Keys.ENTER])
          }
        })
        .waitForElementNotVisible('@searchLoadingIndicator')
        .waitForOutstandingAjaxCalls()
    },
    openCoreMenu: function () {
      return this.waitForElementVisible('@coreMenuOpenButton')
        .click('@coreMenuOpenButton')
        .waitForElementVisible('@coreMenu')
        .waitForAnimationToFinish()
    },
    /**
     * @param {string} page
     */
    navigateToUsingMenu: function (page) {
      const util = require('util')
      const menuItemSelector = util.format(this.elements.menuItem.selector, page)
      return this
        .waitForElementVisible('@menuButton')
        .click('@menuButton')
        .useXpath()
        .waitForElementVisible(menuItemSelector)
        .click(menuItemSelector)
        .api.page.FilesPageElement.filesList()
        .waitForElementPresent({ selector: '@filesListProgressBar', abortOnFailure: false }) // don't fail if we are too late
        .waitForElementNotPresent('@filesListProgressBar')
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
    searchInputFieldHighResolution: {
      selector: '(//input[contains(@class, "oc-search-input")])[1]',
      locateStrategy: 'xpath'
    },
    searchInputFieldLowResolution: {
      selector: '(//input[contains(@class, "oc-search-input")])[3]',
      locateStrategy: 'xpath'
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
    },
    menuButton: {
      selector: '//button[@aria-label="Menu"]',
      locateStrategy: 'xpath'
    },
    menuItem: {
      selector: '//ul[contains(@class, "oc-main-menu")]/li/a[contains(text(),"%s")]',
      locateStrategy: 'xpath'
    }
  }
}
