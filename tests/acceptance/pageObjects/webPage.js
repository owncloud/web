const util = require('util')
const { client } = require('nightwatch-api')
const { join } = require('../helpers/path')
const { defaultUsers } = require('../helpers/userSettings')

module.exports = {
  url: function() {
    return join(this.api.launchUrl, '/#/')
  },
  commands: {
    /**
     *
     * @param {string} searchTerm
     */
    search: function(searchTerm) {
      return this.initAjaxCounters()
        .isVisible('#files-open-search-btn', result => {
          if (result.value === true) {
            this.click('#files-open-search-btn')
              .waitForElementVisible('@searchInputFieldLowResolution')
              .setValue('@searchInputFieldLowResolution', [searchTerm, this.api.Keys.ENTER])
          } else {
            this.waitForElementVisible(
              '@searchInputFieldHighResolution'
            ).setValue('@searchInputFieldHighResolution', [searchTerm, this.api.Keys.ENTER])
          }
        })
        .waitForElementNotVisible('@searchLoadingIndicator')
        .waitForOutstandingAjaxCalls()
    },
    /**
     * @param {string} page
     */
    navigateToUsingMenu: async function(page) {
      const menuItemSelector = util.format(this.elements.menuItem.selector, page)
      let isAppNavigationVisible = false

      // Check if the navigation is visible
      await this.api.element('@appNavigation', result => {
        if (result.status > -1) {
          isAppNavigationVisible = true
        }
      })

      // If app navigation is not visible, try to click on the menu button
      if (!isAppNavigationVisible) {
        this.click('@menuButton').waitForAnimationToFinish()
      }

      await this.useXpath()
        .waitForElementVisible(menuItemSelector)
        .click(menuItemSelector)
        .useCss()
      await this.api.page.FilesPageElement.filesList().waitForLoadingFinished()
      return this
    },
    markNotificationAsRead: function() {
      return this.waitForElementVisible('@notificationBell')
        .click('@notificationBell')
        .waitForElementVisible('@markNotificationAsReadLink')
        .click('@markNotificationAsReadLink')
    },
    closeMessage: function() {
      return this.waitForElementPresent('@messageCloseIcon')
        .click('@messageCloseIcon')
        .waitForElementNotPresent('@messageCloseIcon')
    },
    toggleNotificationDrawer: function() {
      return this.waitForElementVisible('@notificationBell').click('@notificationBell')
    },
    /**
     * gets list of notifications
     *
     * @return {Promise<array>}
     */
    getNotifications: async function() {
      const notifications = []
      await this.toggleNotificationDrawer()
      await this.waitForElementVisible('@notificationElement').api.elements(
        '@notificationElement',
        result => {
          for (const element of result.value) {
            this.api.elementIdText(element.ELEMENT, text => {
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
    acceptAllSharesInNotification: async function() {
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
     * notification bell is present only when the user have got some notifications to show
     * after clicking the notification bell then only user can see notifications received
     * So,there would be no notifications when the notification bell on the top-bar of webUI is not visible
     *
     * @return boolean
     */
    isNotificationBellVisible: async function() {
      let isVisible = false
      await this.api.element('@notificationBell', result => {
        isVisible = result.value === 0
      })
      return isVisible
    },
    /**
     * Perform decline action on the offered shares in the notifications
     */
    declineAllSharesInNotification: async function() {
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
     * Checks if the web page contains any elements on the web container
     *
     * @returns {boolean}
     */
    isPageVisible: async function() {
      let isVisible = true
      await this.api.elements(
        this.elements.webContainer.locateStrategy,
        this.elements.webContainer.selector,
        function(result) {
          isVisible = result.value.length > 0
        }
      )
      return isVisible
    },

    /**
     * Clear all error messages from the webUI
     *
     * @returns {Promise<void>}
     */
    clearAllErrorMessages: async function() {
      let notificationElements, cancelButtons
      await this.api.element('@messages', result => {
        notificationElements = result.value.ELEMENT
      })
      if (!notificationElements) {
        return
      }
      await this.api.elementIdElements(
        notificationElements,
        this.elements.clearErrorMessage.locateStrategy,
        this.elements.clearErrorMessage.selector,
        res => {
          cancelButtons = res.value
        }
      )
      for (const btn of cancelButtons) {
        await this.api.elementIdClick(btn.ELEMENT).waitForAnimationToFinish()
      }
    },
    browseToUserProfile: function() {
      return this.click('@userMenuButton')
    },
    getDisplayedMessage: async function() {
      let element = ''
      let displayedmessage
      await this.waitForElementVisible('@messages')
      await this.api.element('@messages', result => {
        element = result.value.ELEMENT
      })
      await this.api.elementIdText(element, function(result) {
        displayedmessage = result.value
      })
      return displayedmessage
    },
    getLinkSelectorFromNotification: function(resource, sharer) {
      const notifyString = `"${defaultUsers[sharer].displayname}" shared "${resource}" with you`
      const linkSelector = util.format(this.elements.filelink.selector, notifyString)
      return linkSelector
    },
    followLink: function(linkSelector) {
      return this.useXpath()
        .waitForElementVisible(linkSelector)
        .click(linkSelector)
        .useCss()
    },
    getPopupErrorMessages: async function() {
      const messages = []
      await this.api.elements('@messages', function({ value }) {
        value.forEach(async function({ ELEMENT }) {
          await client.elementIdText(ELEMENT, function({ value }) {
            messages.push(value)
          })
        })
      })
      return messages
    }
  },
  elements: {
    message: {
      selector:
        '//*[contains(@class, "uk-notification-message")]/div/div[contains(@class, "oc-notification-message-title")]',
      locateStrategy: 'xpath'
    },
    messages: {
      selector: '//*[contains(@class, "uk-notification-message")]',
      locateStrategy: 'xpath'
    },
    clearErrorMessage: {
      selector: '//div[contains(@class, "oc-alert")]/button[contains(@aria-label, "Close")]',
      locateStrategy: 'xpath'
    },
    notificationBell: {
      selector: '#oc-notification-bell'
    },
    markNotificationAsReadLink: {
      selector: '#resolve-notification-button'
    },
    ocDialogPromptAlert: {
      selector: '.oc-modal .oc-text-input-message'
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
      selector: '#files-global-search-bar .oc-spinner'
    },
    userMenuButton: {
      selector: '#_userMenuButton'
    },
    menuButton: {
      selector: '.oc-app-navigation-toggle'
    },
    menuItem: {
      selector: '//nav[contains(@class, "oc-sidebar-nav")]/ul/li/a[contains(text(),"%s")]',
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
      selector: '.oc-app-container'
    },
    notificationElement: {
      selector: '//div[@id="oc-notification"]//h4',
      locateStrategy: 'xpath'
    },
    declineSharesInNotifications: {
      selector:
        '//div[@id="oc-notification"]//h4[contains(text(),\'%s\')]/../div/button[.="Decline"]',
      locateStrategy: 'xpath'
    },
    acceptSharesInNotifications: {
      selector:
        '//div[@id="oc-notification"]//h4[contains(text(),\'%s\')]/../div/button[.="Accept"]',
      locateStrategy: 'xpath'
    },
    appNavigation: {
      selector: '.oc-app-navigation'
    },
    filelink: {
      selector:
        '//div[@id="oc-notification-drop"]//h4[contains(text(),\'%s\')]/following-sibling::p/a',
      locateStrategy: 'xpath'
    }
  }
}
