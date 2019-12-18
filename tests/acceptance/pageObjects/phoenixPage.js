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
    toggleNotificationDrawer: async function () {
      return this.waitForElementVisible('@notificationBell').click('@notificationBell')
    },
    /**
     * gets list of notifications
     *
     * @return {Promise<array>}
     */
    getNotifications: async function () {
      const notifications = []
      await this.toggleNotificationDrawer()
      await this.api.elements('@notificationElement', result => {
        for (const element of result.value) {
          this.api.elementIdText(element.ELEMENT, text => {
            notifications.push(text.value)
          })
        }
      })
      await this.toggleNotificationDrawer()
      return notifications
    },
    /**
     * Perform accept action on the offered shares in the notifications
     */
    acceptAllSharesInNotification: async function () {
      const notifications = await this.getNotifications()
      await this.toggleNotificationDrawer()
      for (const element of notifications) {
        const acceptShareButton = util.format(this.elements.acceptSharesInNotifications.selector, element)
        await this
          .useXpath()
          .waitForElementVisible(acceptShareButton)
          .click(acceptShareButton)
          .waitForAjaxCallsToStartAndFinish()
          .useCss()
      }
    },
    /**
     * notification bell is present only when the user have got some notifications to show
     * after clicking the notification bell then only user can see notifications received
     * So,there would be no notifications when the notification bell on the top-bar of webUI is not visible
     *
     * @return boolean
     */
    isNotificationBellVisible: async function () {
      let isVisible = false
      await this
        .api.element(
          '@notificationBell',
          result => {
            isVisible = result.value === 0
          }
        )
      return isVisible
    },
    /**
     * Perform decline action on the offered shares in the notifications
     */
    declineAllSharesInNotification: async function () {
      const notifications = await this.getNotifications()
      await this.toggleNotificationDrawer()
      for (const element of notifications) {
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
    },

    /**
     * Clear all error messages from the webUI
     *
     * @returns {Promise<void>}
     */
    clearAllErrorMessages: async function () {
      let notificationElements, cancelButtons
      await this.api.element('@messages', result => {
        notificationElements = result.value.ELEMENT
      })
      if (!notificationElements) {
        return
      }
      await this.api.elementIdElements(notificationElements,
        this.elements.clearErrorMessage.locateStrategy,
        this.elements.clearErrorMessage.selector,
        res => {
          cancelButtons = res.value
        })
      for (const btn of cancelButtons) {
        await this.api.elementIdClick(btn.ELEMENT).waitForAnimationToFinish()
      }
    }
  },
  elements: {
    message: {
      selector: '//*[contains(@class, "uk-notification-message")]/div/div[contains(@class, "oc-notification-message-title")]',
      locateStrategy: 'xpath'
    },
    messages: {
      selector: '//*[contains(@class, "uk-notification-message")]',
      locateStrategy: 'xpath'
    },
    clearErrorMessage: {
      selector: '//*[contains(@class, "oc-alert-close-icon")]',
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
