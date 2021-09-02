/* eslint-disable no-unused-expressions */
const _ = require('lodash')
const timeoutHelper = require('../../helpers/timeoutHelper')
const xpathHelper = require('../../helpers/xpath')
const util = require('util')

module.exports = {
  commands: {
    isThumbnailVisible: function() {
      return this.waitForElementVisible('@sidebar').waitForElementVisible('@fileInfoIcon')
    },
    closeSidebarIfOpen: async function(timeout = 300) {
      if (!(await this.isSideBarOpen(timeout))) {
        return this.api.page.FilesPageElement.filesList()
      }

      try {
        await this.click({
          selector: '@sidebarCloseBtn',
          timeout: timeoutHelper.parseTimeout(timeout)
        })
      } catch (e) {
        // do nothing
      }
      return this.api.page.FilesPageElement.filesList()
    },
    isSideBarOpen: async function(timeout = 500) {
      const element = this.elements.sidebar
      let isVisible = false
      await this.isVisible(
        {
          locateStrategy: element.locateStrategy,
          selector: element.selector,
          timeout: timeoutHelper.parseTimeout(timeout)
        },
        result => {
          isVisible = result.value === true
        }
      )
      return isVisible
    },
    isSideBarOpenForResource: async function(resource, elementType = 'any', timeout = 500) {
      if (!(await this.isSideBarOpen(timeout))) {
        return false
      }
      const selector = this.getResourceInfoSelector(resource, elementType)
      let resourceInfoVisible = false
      await this.isVisible({ locateStrategy: 'xpath', selector, timeout }, result => {
        resourceInfoVisible = result.status === 0
      })
      return resourceInfoVisible
    },
    getResourceInfoSelector: function(resource, elementType = 'any') {
      const name = xpathHelper.buildXpathLiteral(resource)
      const path = xpathHelper.buildXpathLiteral('/' + resource)
      if (elementType === 'any') {
        return util.format(this.elements.fileInfoResourceNameAnyType.selector, name, path)
      }
      const type = xpathHelper.buildXpathLiteral(elementType)
      return util.format(this.elements.fileInfoResourceName.selector, name, path, type)
    },
    activatePanel: async function(item) {
      const panelName = item === 'people' ? 'collaborators' : item
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
            backBtnVisible = result.value === true
          }
        )
        if (backBtnVisible) {
          await this.click({
            selector: '@sidebarBackBtn'
          })
          await this.waitForAnimationToFinish() // wait for sliding animation to the root panel
        }
        const menuItemElement = this.elements[panelName + 'PanelMenuItem']
        await this.click({
          locateStrategy: menuItemElement.locateStrategy,
          selector: menuItemElement.selector
        })
          .waitForAjaxCallsToStartAndFinish()
          .waitForAnimationToFinish() // wait for sliding animation to the sub panel
      }
      const panelElement = this.elements[panelName + 'Panel']
      return await this.waitForElementPresent(panelElement.locateStrategy, panelElement.selector)
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
      let isVisible = false
      await this.isVisible(
        {
          locateStrategy: element.locateStrategy,
          selector: element.selector,
          timeout: timeoutHelper.parseTimeout(timeout)
        },
        result => {
          isVisible = result.value === true
        }
      )
      return isVisible
    },
    /**
     * checks if it's possible to navigate into the given panel
     *
     * @param {string} panelName
     * @param {number} timeout
     * @returns {Promise<boolean>}
     */
    isPanelSelectable: async function(panelName, timeout = 300) {
      panelName = panelName === 'people' ? 'collaborators' : panelName
      const element = this.elements[panelName + 'PanelMenuItem']
      let isVisible = false
      await this.isVisible(
        {
          locateStrategy: element.locateStrategy,
          selector: element.selector,
          timeout: timeoutHelper.parseTimeout(timeout)
        },
        result => {
          isVisible = result.value === true
        }
      )
      return isVisible
    },
    isLinksPanelSelectable: async function() {
      return await this.isPanelSelectable('links')
    },
    isSharingPanelSelectable: async function() {
      return await this.isPanelSelectable('people')
    },
    markFavoriteSidebar: function() {
      return this.waitForElementVisible('@sidebar')
        .waitForElementVisible('@fileInfoFavoriteDimm')
        .click('@fileInfoFavorite')
        .waitForElementVisible('@fileInfoFavoriteShining')
    },
    unmarkFavoriteSidebar: function() {
      return this.waitForElementVisible('@sidebar')
        .waitForElementVisible('@fileInfoFavoriteShining')
        .click('@fileInfoFavorite')
        .waitForElementVisible('@fileInfoFavoriteDimm')
    }
  },
  elements: {
    sidebar: {
      selector: '//*[@id="files-sidebar"]',
      locateStrategy: 'xpath'
    },
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
    fileInfoResourceNameAnyType: {
      selector: `//div[contains(@id, "files-sidebar")]//span[contains(@class, "oc-resource-name") and (@data-test-resource-name=%s or @data-test-resource-path=%s)]`,
      locateStrategy: 'xpath'
    },
    fileInfoResourceName: {
      selector: `//div[contains(@id, "files-sidebar")]//span[contains(@class, "oc-resource-name") and (@data-test-resource-name=%s or @data-test-resource-path=%s) and @data-test-resource-type=%s]`,
      locateStrategy: 'xpath'
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
    collaboratorsPanel: {
      selector: '//*[@id="sidebar-panel-sharing-item"]',
      locateStrategy: 'xpath'
    },
    collaboratorsPanelMenuItem: {
      selector: '//button[@id="sidebar-panel-sharing-item-select"]',
      locateStrategy: 'xpath'
    },
    linksPanel: {
      selector: '//*[@id="sidebar-panel-links-item"]',
      locateStrategy: 'xpath'
    },
    linksPanelMenuItem: {
      selector: '//button[@id="sidebar-panel-links-item-select"]',
      locateStrategy: 'xpath'
    },
    actionsPanel: {
      selector: '//*[@id="sidebar-panel-actions-item"]',
      locateStrategy: 'xpath'
    },
    actionsPanelMenuItem: {
      selector: '//button[@id="sidebar-panel-actions-item-select"]',
      locateStrategy: 'xpath'
    },
    detailsPanel: {
      selector: '//*[@id="sidebar-panel-details-item"]',
      locateStrategy: 'xpath'
    },
    detailsPanelMenuItem: {
      selector: '//button[@id="sidebar-panel-details-item-select"]',
      locateStrategy: 'xpath'
    },
    versionsPanel: {
      selector: '//*[@id="sidebar-panel-versions-item"]',
      locateStrategy: 'xpath'
    },
    versionsPanelMenuItem: {
      selector: '//button[@id="sidebar-panel-versions-item-select"]',
      locateStrategy: 'xpath'
    }
  }
}
