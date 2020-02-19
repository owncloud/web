module.exports = {
  commands: {
    isThumbnailVisible: function () {
      return this
        .waitForElementVisible(this.elements.sideBar)
        .waitForElementVisible(this.elements.sidebarThumbnail)
    },
    closeSidebar: function (timeout = null) {
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
    }
  }
}
