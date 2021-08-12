/* eslint-disable no-unused-expressions */
const util = require('util')
const _ = require('lodash')
const timeoutHelper = require('../../helpers/timeoutHelper')

module.exports = {
  commands: {
    isThumbnailVisible: function() {
      return this.waitForElementVisible(
        this.api.page.personalPage().elements.sideBar
      ).waitForElementVisible(this.elements.fileInfoIcon)
    },
    closeSidebar: function(timeout = null) {
      timeout = timeoutHelper.parseTimeout(timeout)
      try {
        this.click({
          selector: '@sidebarCloseBtn',
          timeout: timeout
        })
      } catch (e) {
        // do nothing
      }
      return this.api.page.FilesPageElement.filesList()
    },
    activatePanel: async function(item) {
      await this.waitForElementVisible(this.api.page.personalPage().elements.sideBar)
      const active = await this.isPanelActive(
        item,
        this.api.globals.waitForNegativeConditionTimeout
      )
      if (!active) {
        let backBtnVisible = false
        const backBtn = this.elements.sidebarBackBtn
        await this.isVisible(
          { locateStrategy: backBtn.locateStrategy, selector: backBtn.selector, timeout: 200 },
          result => {
            backBtnVisible = result.status === 0
          }
        )
        if (backBtnVisible) {
          await this.click({
            selector: '@sidebarBackBtn'
          })
          await this.waitForAnimationToFinish() // wait for sliding animation to the root panel
        }
        this.useXpath()
          .click(this.getXpathOfPanelSelect(item))
          .waitForAjaxCallsToStartAndFinish()
          .useCss()
        await this.waitForAnimationToFinish() // wait for sliding animation to the sub panel
      }
      const panelName = item === 'people' ? 'collaborators' : item
      const element = this.elements[panelName + 'Panel']
      const selector = element.selector
      return this.waitForElementPresent(selector)
    },
    /**
     * return the complete xpath of the link to the specified panel in the side-bar
     * @param item
     * @returns {string}
     */
    getXpathOfPanelSelect: function(item) {
      return (
        this.api.page.personalPage().elements.sideBar.selector +
        util.format(
          "//button[contains(translate(.,'ABCDEFGHJIKLMNOPQRSTUVWXYZ','abcdefghjiklmnopqrstuvwxyz'),'%s')]",
          item
        )
      )
    },
    getVisibleAccordionItems: async function() {
      const items = []
      let elements
      await this.api.elements('@panelSelectButtons', function(result) {
        elements = result.value
      })
      for (const { ELEMENT } of elements) {
        await this.api.elementIdText(ELEMENT, function(result) {
          items.push(result.value.toLowerCase())
        })
      }
      return items
    },
    getVisibleActionsMenuItems: async function() {
      const items = []
      let elements
      await this.api.elements('@panelActionsItems', function(result) {
        elements = result.value
      })
      for (const { ELEMENT } of elements) {
        await this.api.elementIdText(ELEMENT, function(result) {
          items.push(result.value.toLowerCase())
        })
      }
      return items
    },
    getActionsMenuItemsExceptDefaults: async function() {
      const defaultItems = ['add to favorites', 'copy', 'move', 'rename', 'delete']
      const items = []
      let elements
      await this.api.elements('@panelActionsItems', function(result) {
        elements = result.value
      })
      for (const { ELEMENT } of elements) {
        await this.api.elementIdText(ELEMENT, function(result) {
          let notDefault = true
          for (const item of defaultItems) {
            if (_.isEqual(item, result.value.toLowerCase())) {
              notDefault = false
              break
            }
          }
          notDefault ? items.push(result.value.toLowerCase()) : null
        })
      }
      return items
    },
    isPanelActive: async function(panelName, timeout = null) {
      panelName = panelName === 'people' ? 'collaborators' : panelName
      const element = this.elements[panelName + 'Panel']
      const selector = element.selector + '.is-active'
      let isVisible = false
      timeout = timeoutHelper.parseTimeout(timeout)
      await this.isVisible({ locateStrategy: 'css selector', selector, timeout }, result => {
        isVisible = result.value === true
      })
      return isVisible
    },
    /**
     * checks if the item with the given selector is present on the files-page-sidebar
     *
     * @param {object} selector
     * @returns {Promise<boolean>}
     */
    isPanelItemPresent: async function(selector) {
      let isPresent = true
      await this.useXpath()
        .waitForElementVisible(this.api.page.personalPage().elements.sideBar) // sidebar is expected to be opened and visible
        .api.elements(selector, result => {
          isPresent = result.value.length > 0
        })
        .useCss()
      return isPresent
    },
    /**
     * @returns {Promise<boolean>}
     */
    isLinksPanelSelectPresent: function() {
      return this.isPanelItemPresent(this.elements.linksPanelSelect)
    },
    /**
     * @returns {Promise<boolean>}
     */
    isCollaboratorsAccordionItemPresent: function() {
      return this.isPanelItemPresent(this.elements.collaboratorsPanel)
    },
    markFavoriteSidebar: function() {
      return this.useXpath()
        .waitForElementVisible(this.api.page.personalPage().elements.sideBar)
        .waitForElementVisible('@fileInfoFavoriteDimm')
        .click('@fileInfoFavorite')
        .waitForElementVisible('@fileInfoFavoriteShining')
    },
    unmarkFavoriteSidebar: function() {
      return this.waitForElementVisible(this.api.page.personalPage().elements.sideBar)
        .waitForElementVisible('@fileInfoFavoriteShining')
        .click('@fileInfoFavorite')
        .waitForElementVisible('@fileInfoFavoriteDimm')
    }
  },
  elements: {
    fileInfoIcon: {
      selector: '.file_info .oc-icon'
    },
    fileInfoFavorite: {
      selector: '.file_info__favorite'
    },
    fileInfoFavoriteShining: {
      selector: '.oc-star-shining'
    },
    fileInfoFavoriteDimm: {
      selector: '.oc-star-dimm'
    },
    sidebarCloseBtn: {
      selector:
        '//div[contains(@id, "files-sidebar")]//div[contains(@class, "is-active")]//button[contains(@class, "header__close")]',
      locateStrategy: 'xpath'
    },
    sidebarBackBtn: {
      selector:
        '//div[contains(@id, "files-sidebar")]//div[contains(@class, "is-active")]//button[contains(@class, "header__back")]',
      locateStrategy: 'xpath'
    },
    panelActionsItems: {
      selector: '//span[@class="oc-files-actions-sidebar-action-label"]',
      locateStrategy: 'xpath'
    },
    panelSelectButtons: {
      selector:
        '//div[contains(@id, "files-sidebar")]//div[@class="sidebar-panel__navigation"]/button',
      locateStrategy: 'xpath'
    },
    linksPanelSelect: {
      selector: '#sidebar-panel-links-item-select'
    },
    collaboratorsPanel: {
      selector: '#sidebar-panel-sharing-item'
    },
    linksPanel: {
      selector: '#sidebar-panel-links-item'
    },
    actionsPanel: {
      selector: '#sidebar-panel-actions-item'
    },
    detailsPanel: {
      selector: '#sidebar-panel-details-item'
    },
    versionsPanel: {
      selector: '#sidebar-panel-versions-item'
    }
  }
}
