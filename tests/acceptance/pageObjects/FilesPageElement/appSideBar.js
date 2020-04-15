module.exports = {
  commands: {
    isThumbnailVisible: function() {
      return this.waitForElementVisible(this.elements.sideBar).waitForElementVisible(
        this.elements.sidebarThumbnail
      )
    },
    /**
     * @returns {*}
     */
    openVersionsTab: function() {
      return this.waitForElementVisible('@sidebarVersionsTab').click('@sidebarVersionsTab')
    },
    closeSidebar: function(timeout = null) {
      if (timeout === null) {
        timeout = this.api.globals.waitForConditionTimeout
      } else {
        timeout = parseInt(timeout, 10)
      }
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
    sidebarLinksTab: {
      selector: '//div[@class="sidebar-container"]//a[contains(text(),"Links")]',
      locateStrategy: 'xpath'
    },
    sidebarCollaboratorsTab: {
      selector: '//div[@class="sidebar-container"]//a[contains(text(),"Collaborators")]',
      locateStrategy: 'xpath'
    },
    sidebarVersionsTab: {
      selector: '//div//a[normalize-space(.)="Versions"]',
      locateStrategy: 'xpath'
    }
  }
}
