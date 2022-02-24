const { join } = require('../helpers/path')

module.exports = {
  url: function () {
    return join(this.api.launchUrl, '/files/favorites/')
  },
  commands: {
    /**
     * like build-in navigate() but also waits till for the progressbar to appear and disappear
     * @returns {*}
     */
    navigateAndWaitTillLoaded: function () {
      return this.navigate(this.url()).waitForElementPresent(
        this.page.FilesPageElement.filesList().elements.anyAfterLoading
      )
    }
  }
}
