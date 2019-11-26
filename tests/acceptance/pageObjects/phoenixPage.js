const assert = require('assert')
const util = require('util')

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
    /**
     * @param {string} page
     */
    navigateToUsingMenu: function (page) {
      const menuItemSelector = util.format(this.elements.menuItem.selector, page)
      return this
        .waitForElementVisible('@menuButton')
        .click('@menuButton')
        .useXpath()
        .waitForElementVisible(menuItemSelector)
        .waitForAnimationToFinish()
        .click(menuItemSelector)
        .api.page.FilesPageElement.filesList()
        .waitForElementPresent({ selector: '@filesListProgressBar', abortOnFailure: false }) // don't fail if we are too late
        .waitForElementNotPresent('@filesListProgressBar')
    },
    markNotificationAsRead: function () {
      return this.waitForElementVisible('@notificationBell')
        .click('@notificationBell')
        .waitForElementVisible('@markNotificationAsReadLink')
        .click('@markNotificationAsReadLink')
    },
    closeMessage: function () {
      return this.waitForElementPresent('@messageCloseIcon')
        .click('@messageCloseIcon')
        .waitForElementNotPresent('@messageCloseIcon')
    },
    getNotifications: async function () {
      const notifications = []
      await this
        .click('@notificationBell')
        .waitForElementVisible('@notificationElement')
      await this.api.elements('@notificationElement', result => {
        for (const element of result.value) {
          this.api.elementIdText(element.ELEMENT, text => {
            notifications.push(text.value)
          })
        }
      })
      return notifications
    },
    /**
     * Checks if the notifications consists of all the expected notifications
     * @param {string} expectedNotifications
     */
    assertNotificationIsPresent: async function (numberOfNotifications, expectedNotifications) {
      const notifications = await this.getNotifications()
      assert.strictEqual(notifications.length, numberOfNotifications)
      for (const element of expectedNotifications) {
        const isPresent = notifications.includes(element.title)
        this.assert.ok(isPresent)
      }
    },
    /**
     * Perform accept action on the offered shares in the notifications
     */
    acceptAllSharesInNotification: async function () {
      const notifications = await this.getNotifications()
      for (const element of notifications) {
        const acceptShareButton = util.format(this.elements.acceptSharesInNotifications.selector, element)
        await this
          .useXpath()
          .waitForElementVisible(acceptShareButton)
          .click(acceptShareButton)
          .waitForAjaxCallsToStartAndFinish()
      }
    },
    /**
     * Checks to assert the notification bell is not present as well as no notifications are present
     */
    assertNoNotifications: function () {
      return this.waitForElementNotPresent('@notificationBell')
        .assert.elementNotPresent(this.elements.notificationElement)
    },
    /**
     * Perform decline action on the offered shares in the notifications
     */
    declineAllSharesInNotification: async function () {
      const notifications = await this.getNotifications()
      for (const element of notifications) {
        console.log(element)
        const declineShareButton = util.format(this.elements.declineSharesInNotifications.selector, element)
        await this
          .useXpath()
          .waitForElementVisible(declineShareButton)
          .click(declineShareButton)
          .waitForAjaxCallsToStartAndFinish()
      }
    },
    /**
     * Checks if the phoenix page contains any elements on the phoenix container
     *
     * @returns {boolean}
     */
    isPageVisible: async function () {
      let isVisible = true
      await this.api.elements(this.elements.phoenixContainer.locateStrategy,
        this.elements.phoenixContainer.selector, function (result) {
          isVisible = result.value.length > 0
        })
      return isVisible
    }
  },
  elements: {
    message: {
      selector: '//*[contains(@class, "uk-notification-message")]/div/div[contains(@class, "oc-notification-message-title")]',
      locateStrategy: 'xpath'
    },
    notificationBell: {
      selector: '#oc-notification-bell'
    },
    markNotificationAsReadLink: {
      selector: '#resolve-notification-button'
    },
    ocDialogPromptAlert: {
      selector: '.uk-modal.uk-open .oc-dialog-prompt-alert'
    },
    searchInputFieldHighResolution: {
      selector: '(//input[contains(@class, "oc-search-input")])[1]',
      locateStrategy: 'xpath'
    },
    searchInputFieldLowResolution: {
      selector: '(//input[contains(@class, "oc-search-input")])[2]',
      locateStrategy: 'xpath'
    },
    searchLoadingIndicator: {
      selector: '.oc-app-bar .uk-spinner'
    },
    menuButton: {
      selector: '//button[@aria-label="Menu"]',
      locateStrategy: 'xpath'
    },
    menuItem: {
      selector: '//ul[contains(@class, "oc-main-menu")]/li/a[contains(text(),"%s")]',
      locateStrategy: 'xpath'
    },
    logoutMenuItem: {
      selector: '#logoutMenuItem'
    },
    messageCloseIcon: {
      selector: '.oc-alert-close-icon'
    },
    phoenixContainer: {
      selector: '#Phoenix'
    },
    appContainer: {
      selector: '#oc-app-container'
    },
    notificationElement: {
      selector: '//div[@id="oc-notification"]//h5',
      locateStrategy: 'xpath'
    },
    declineSharesInNotifications: {
      selector: '//div[@id="oc-notification"]//h5[contains(text(),\'%s\')]/../div/button/span[.="Decline"]',
      locateStrategy: 'xpath'
    },
    acceptSharesInNotifications: {
      selector: '//div[@id="oc-notification"]//h5[contains(text(),\'%s\')]/../div/button/span[.="Accept"]',
      locateStrategy: 'xpath'
    }
  }
}
