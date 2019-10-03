module.exports = {
  commands: {
    isThumbnailVisible: function () {
      return this
        .waitForElementVisible(this.elements.sideBar)
        .waitForElementVisible(this.elements.sidebarThumbnail)
    }
  },
  elements: {
    sideBar: {
      selector: '.sidebar-container'
    },
    sidebarThumbnail: {
      selector: '.sidebar-title .oc-icon'
    }
  }
}
