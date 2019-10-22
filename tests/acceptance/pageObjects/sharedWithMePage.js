const navigationHelper = require('../helpers/navigationHelper')
const util = require('util')
module.exports = {
  url: function () {
    return this.api.launchUrl + '/#/files/shared-with-me/'
  },
  commands: {
    /**
     * like build-in navigate() but also waits till for the progressbar to appear and disappear
     * @returns {*}
     */
    navigateAndWaitTillLoaded: function () {
      return navigationHelper.navigateAndWaitTillLoaded(
        this.url(), this.page.FilesPageElement.filesList().elements.filesListProgressBar
      )
    },
    assertFileStatusIsShown: function (filename, status) {
      return this.waitForElementVisible({
        locateStrategy: this.elements.fileStatusOfFileRow.locateStrategy,
        selector: this.api.page
          .FilesPageElement.filesList().getFileRowSelectorByFileName(filename) +
          util.format(this.elements.fileStatusOfFileRow.selector, status)
      })
    }
  },
  elements: {
    fileStatusOfFileRow: {
      selector: '//span[.="%s"]',
      locateStrategy: 'xpath'
    }
  }
}
