const util = require('util')
const { client } = require('nightwatch-api')
const { join } = require('../helpers/path')

module.exports = {
  url: function () {
    return join(this.api.launchUrl, '/')
  },
  commands: {
    /**
     * @param {string} page
     */
    navigateToUsingMenu: async function (page) {
      const menuItemSelector = util.format(this.elements.menuItem.selector, page)
      let isAppNavigationVisible = false

      // Check if the navigation is visible
      await this.isVisible(
        {
          selector: '@appNavigation',
          timeout: this.api.globals.waitForNegativeConditionTimeout,
          suppressNotFoundErrors: true
        },
        (result) => {
          isAppNavigationVisible = result.value === true
        }
      )

      // If app navigation is not visible, try to click on the menu button
      if (!isAppNavigationVisible) {
        this.click('@menuButton').waitForAnimationToFinish()
      }

      await this.useXpath().waitForElementVisible(menuItemSelector).click(menuItemSelector).useCss()
      await this.api.page.FilesPageElement.filesList().waitForLoadingFinished()
      return this
    },
    closeMessage: function () {
      return this.waitForElementPresent('@messageCloseIcon')
        .click('@messageCloseIcon')
        .waitForElementNotPresent('@messageCloseIcon')
    },
    toggleNotificationDrawer: function () {
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
      await this.waitForElementVisible('@notificationElement').api.elements(
        '@notificationElement',
        (result) => {
          for (const element of result.value) {
            this.api.elementIdText(element.ELEMENT, (text) => {
              notifications.push(text.value)
            })
          }
        }
      )
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
        const acceptShareButton = util.format(
          this.elements.acceptSharesInNotifications.selector,
          element
        )
        await this.useXpath()
          .waitForElementVisible(acceptShareButton)
          .click(acceptShareButton)
          .waitForAjaxCallsToStartAndFinish()
          .useCss()
      }
    },
    /**
     * Perform decline action on the offered shares in the notifications
     */
    declineAllSharesInNotification: async function () {
      const notifications = await this.getNotifications()
      await this.toggleNotificationDrawer()
      for (const element of notifications) {
        const declineShareButton = util.format(
          this.elements.declineSharesInNotifications.selector,
          element
        )
        await this.useXpath()
          .waitForElementVisible(declineShareButton)
          .click(declineShareButton)
          .waitForAjaxCallsToStartAndFinish()
      }
    },

    /**
     * Clear all error messages from the webUI
     *
     * @returns {Promise<void>}
     */
    clearAllErrorMessages: async function () {
      let notificationElements, cancelButtons
      await this.api.element('@errorMessages', (result) => {
        notificationElements = result.value.ELEMENT
      })
      if (!notificationElements) {
        return
      }
      await this.api.elementIdElements(
        notificationElements,
        this.elements.clearErrorMessage.locateStrategy,
        this.elements.clearErrorMessage.selector,
        (res) => {
          cancelButtons = res.value
        }
      )
      for (const btn of cancelButtons) {
        await this.api.elementIdClick(btn.ELEMENT).waitForAnimationToFinish()
      }
    },
    browseToUserProfile: function () {
      return this.click('@userMenuButton')
    },
    getDisplayedMessage: async function (type, titleOnly = false) {
      let element = ''
      let displayedmessage
      let selector = titleOnly ? '@message' : '@messages'
      if (type === 'error') {
        selector = titleOnly ? '@errorMessage' : '@errorMessages'
      } else if (type === 'modal error') {
        selector = '@modalErrorMessage'
      }
      await this.waitForElementVisible(selector)
      await this.api.element(selector, (result) => {
        element = result.value.ELEMENT
      })
      await this.api.elementIdText(element, function (result) {
        displayedmessage = result.value
      })
      return displayedmessage
    },
    followLink: function (linkSelector) {
      return this.useXpath().waitForElementVisible(linkSelector).click(linkSelector).useCss()
    },
    getPopupErrorMessages: async function () {
      const messages = []
      await this.waitForElementVisible('@errorMessages')
      await this.api.elements('@errorMessages', function ({ value }) {
        value.forEach(async function ({ ELEMENT }) {
          await client.elementIdText(ELEMENT, function ({ value }) {
            messages.push(value)
          })
        })
      })
      return messages
    },
    hasErrorMessage: async function (expectedVisible = true) {
      let visible = false
      const timeout = expectedVisible
        ? this.api.globals.waitForConditionTimeout
        : this.api.globals.waitForNegativeConditionTimeout

      const selector = {
        selector: this.elements.errorMessage.selector,
        locateStrategy: this.elements.errorMessage.locateStrategy
      }

      await this.isVisible(
        { ...selector, suppressNotFoundErrors: !expectedVisible, timeout },
        function ({ value }) {
          visible = value === true
        }
      )
      return visible
    }
  },
  elements: {
    message: {
      selector:
        '//*[contains(@class, "oc-notification-message")]//div[contains(@class, "oc-notification-message-title")]',
      locateStrategy: 'xpath'
    },
    messages: {
      selector: '//*[contains(@class, "oc-notification-message")]',
      locateStrategy: 'xpath'
    },
    errorMessage: {
      selector:
        '//*[contains(@class, "oc-notification-message-danger")]//div[contains(@class, "oc-notification-message-title")]',
      locateStrategy: 'xpath'
    },
    modalErrorMessage: {
      selector:
        '//div[@class=\'oc-modal-body\']/div[contains(@class, "oc-modal-body-message")]/span',
      locateStrategy: 'xpath'
    },
    errorMessages: {
      selector:
        '//div[contains(@class, "oc-notification-message-danger")]//div[@class="oc-notification-message-title"]',
      locateStrategy: 'xpath'
    },
    clearErrorMessage: {
      selector:
        '//*[contains(@class, "oc-notification-message-danger")]//button[contains(@aria-label, "Close")]',
      locateStrategy: 'xpath'
    },
    notificationBell: {
      selector: '#oc-notifications-bell'
    },
    ocDialogPromptAlert: {
      selector: '.oc-modal .oc-text-input-message'
    },
    searchInputField: {
      selector: '(//input[contains(@class, "oc-search-input")])[1]',
      locateStrategy: 'xpath'
    },
    searchLoadingIndicator: {
      selector: '#files-global-search-bar .oc-spinner'
    },
    searchGlobalButton: {
      selector: '//button[.="Search all files ↵"]',
      locateStrategy: 'xpath'
    },
    openSearchButton: {
      selector: '.mobile-search-btn'
    },
    userMenuButton: {
      selector: '#_userMenuButton'
    },
    menuButton: {
      selector: '.oc-app-navigation-toggle'
    },
    menuItem: {
      selector:
        '//nav[contains(@class, "oc-sidebar-nav")]/ul/li/a/span/span[contains(text(),"%s")]',
      locateStrategy: 'xpath'
    },
    logoutMenuItem: {
      selector: '#oc-topbar-account-logout'
    },
    messageCloseIcon: {
      selector: '.oc-alert-close-icon'
    },
    webContainer: {
      selector: '#web'
    },
    appContainer: {
      selector: '.app-container'
    },
    notificationElement: {
      selector: '//div[@id="oc-notifications"]//div[contains(@class, "oc-notifications-message")]',
      locateStrategy: 'xpath'
    },
    declineSharesInNotifications: {
      selector:
        '//div[@id="oc-notifications"]//span[contains(text(),\'%s\')]/../../div/button[contains(@class, "oc-button-passive")]',
      locateStrategy: 'xpath'
    },
    acceptSharesInNotifications: {
      selector:
        '//div[@id="oc-notifications"]//span[contains(text(),\'%s\')]/../../div/button[contains(@class, "oc-button-primary")]',
      locateStrategy: 'xpath'
    },
    appNavigation: {
      selector: '#web-nav-sidebar'
    }
  }
}
