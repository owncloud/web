/* eslint-disable no-unused-expressions */
const timeoutHelper = require('../../helpers/timeoutHelper')

module.exports = {
  commands: {
    isThumbnailVisible: function() {
      return this.waitForElementVisible(this.elements.sideBar).waitForElementVisible(
        this.elements.sidebarThumbnail
      )
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
    /**
     * checks if the given tabs are present on the files-page-sidebar
     *
     * @param {string} tabSelectorXpath
     * @returns {Promise<boolean>}
     */
    isTabPresentOnCurrentSidebar: async function(tabSelectorXpath) {
      let isPresent = true
      await this.useXpath()
        .waitForElementVisible('@sideBar') // sidebar is expected to be opened and visible
        .api.elements('xpath', tabSelectorXpath, result => {
          isPresent = result.value.length > 0
        })
        .useCss()
      return isPresent
    },
    /**
     * @returns {Promise<boolean>}
     */
    isLinksTabPresentOnCurrentSidebar: function() {
      return this.isTabPresentOnCurrentSidebar(this.elements.sidebarLinksTab.selector)
    },
    /**
     * @returns {Promise<boolean>}
     */
    isCollaboratorsTabPresentOnCurrentSidebar: function() {
      return this.isTabPresentOnCurrentSidebar(this.elements.sidebarCollaboratorsTab.selector)
    },
    markFavoriteSidebar: function() {
      return this.useXpath()
        .waitForElementVisible('@sideBar')
        .waitForElementVisible('@favoriteStarDimm')
        .click('@sidebarToggleFavoriteButton')
        .waitForElementVisible('@favoriteStarShining')
    },
    unmarkFavoriteSidebar: function() {
      return this.waitForElementVisible('@sideBar')
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
    sideBar: {
      selector: '.sidebar-container'
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
    }
  }
}
