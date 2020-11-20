/* eslint-disable no-unused-expressions */
const util = require('util')
const timeoutHelper = require('../../helpers/timeoutHelper')

module.exports = {
  commands: {
    isThumbnailVisible: function() {
      return this.waitForElementVisible(
        this.api.page.filesPage().elements.sideBar
      ).waitForElementVisible(this.elements.sidebarThumbnail)
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
    selectTab: async function(tab) {
      await this.waitForElementVisible(this.api.page.filesPage().elements.sideBar)
      const panelVisible = await this.isPanelVisible(
        tab,
        this.api.globals.waitForNegativeConditionTimeout
      )
      if (panelVisible) {
        return this
      } else {
        return this.useXpath()
          .click(this.getXpathOfLinkToTabInSidePanel(tab))
          .useCss()
      }
    },
    /**
     * return the complete xpath of the link to the specified tab in the side-bar
     * @param tab
     * @returns {string}
     */
    getXpathOfLinkToTabInSidePanel: function(tab) {
      return (
        this.api.page.filesPage().elements.sideBar.selector +
        util.format(this.elements.tabOfSideBar.selector, tab)
      )
    },
    getVisibleTabs: async function() {
      const tabs = []
      let elements
      await this.api.elements('@tabsInSideBar', function(result) {
        elements = result.value
      })
      for (const { ELEMENT } of elements) {
        await this.api.elementIdText(ELEMENT, function(result) {
          tabs.push(result.value.toLowerCase())
        })
      }
      return tabs
    },
    isPanelVisible: async function(panelName, timeout = null) {
      panelName = panelName === 'people' ? 'collaborators' : panelName
      const selector = this.elements[panelName + 'Panel']
      let isVisible = false
      timeout = timeoutHelper.parseTimeout(timeout)
      await this.isVisible(
        { locateStrategy: 'css selector', selector: selector.selector, timeout: timeout },
        result => {
          isVisible = result.status === 0
        }
      )
      return isVisible
    },
    /**
     * checks if the given tabs are present on the files-page-sidebar
     *
     * @param {object} tabSelector
     * @returns {Promise<boolean>}
     */
    isTabPresentOnCurrentSidebar: async function(tabSelector) {
      let isPresent = true
      await this.useXpath()
        .waitForElementVisible(this.api.page.filesPage().elements.sideBar) // sidebar is expected to be opened and visible
        .api.elements(tabSelector, result => {
          isPresent = result.value.length > 0
        })
        .useCss()
      return isPresent
    },
    /**
     * @returns {Promise<boolean>}
     */
    isLinksTabPresentOnCurrentSidebar: function() {
      return this.isTabPresentOnCurrentSidebar(this.elements.sidebarLinksTab)
    },
    /**
     * @returns {Promise<boolean>}
     */
    isCollaboratorsTabPresentOnCurrentSidebar: function() {
      return this.isTabPresentOnCurrentSidebar(this.elements.sidebarCollaboratorsTab)
    },
    markFavoriteSidebar: function() {
      return this.useXpath()
        .waitForElementVisible(this.api.page.filesPage().elements.sideBar)
        .waitForElementVisible('@favoriteStarDimm')
        .click('@sidebarToggleFavoriteButton')
        .waitForElementVisible('@favoriteStarShining')
    },
    unmarkFavoriteSidebar: function() {
      return this.waitForElementVisible(this.api.page.filesPage().elements.sideBar)
        .waitForElementVisible('@favoriteStarShining')
        .click('@sidebarToggleFavoriteButton')
        .waitForElementVisible('@favoriteStarDimm')
    },
    openCollaboratorsTab: function() {
      return this.click('@sidebarCollaboratorsTab')
    },
    openVersionsTab: function() {
      return this.click('@sidebarVersionsTab')
    },
    openLinksTab: function() {
      return this.click('@sidebarLinksTab')
    }
  },
  elements: {
    /**
     * path from inside the side-bar
     */
    tabOfSideBar: {
      // the translate bit is to make it case-insensitive
      selector:
        "//button[contains(translate(.,'ABCDEFGHJIKLMNOPQRSTUVWXYZ','abcdefghjiklmnopqrstuvwxyz'),'%s')]",
      locateStrategy: 'xpath'
    },
    tabsInSideBar: {
      selector: '//div[@class="sidebar-container"]//li/h3/button',
      locateStrategy: 'xpath'
    },
    sidebarThumbnail: {
      selector: '.sidebar-title .oc-icon'
    },
    sidebarCloseBtn: {
      selector: '//div[@class="sidebar-container"]//div[@class="action"]//button',
      locateStrategy: 'xpath'
    },
    sidebarCollaboratorsTab: {
      selector: '#app-sidebar-files-sharing'
    },
    sidebarLinksTab: {
      selector: '#app-sidebar-file-link'
    },
    sidebarVersionsTab: {
      selector: '#app-sidebar-files-version'
    },
    sidebarToggleFavoriteButton: {
      selector: '#files-sidebar-star-icon'
    },
    favoriteStarDimm: {
      selector: '.oc-star-dimm'
    },
    favoriteStarShining: {
      selector: '.oc-star-shining'
    },
    versionsPanel: {
      selector: '#oc-file-versions-sidebar'
    },
    collaboratorsPanel: {
      selector: '#oc-files-sharing-sidebar'
    },
    linksPanel: {
      selector: '#oc-files-file-link'
    },
    actionsPanel: {
      selector: '#oc-files-actions-sidebar'
    }
  }
}
