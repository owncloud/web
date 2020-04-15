const navigationHelper = require('../helpers/navigationHelper')
const { join } = require('../helpers/path')

module.exports = {
  url: function() {
    return join(this.api.launchUrl, '/#/files/favorites/')
  },
  commands: {
    /**
     * like build-in navigate() but also waits till for the progressbar to appear and disappear
     * @returns {*}
     */
    navigateAndWaitTillLoaded: function() {
      return navigationHelper.navigateAndWaitTillLoaded(
        this.url(),
        this.page.FilesPageElement.filesList().elements.filesListProgressBar
      )
    }
  }
}
