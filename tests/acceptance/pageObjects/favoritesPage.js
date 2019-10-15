const navigationHelper = require('../helpers/navigationHelper')

module.exports = {
  url: function () {
    return this.api.launchUrl + '/#/files/favorites/'
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
    }
  }
}
