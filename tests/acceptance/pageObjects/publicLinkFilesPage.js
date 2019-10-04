const navigationHelper = require('../helpers/navigationHelper')

module.exports = {
  commands: {
    /**
     * like build-in navigate() but also waits till for the progressbar to appear and disappear
     * @returns {*}
     */
    navigateAndWaitTillLoaded: function (token) {
      return navigationHelper.navigateAndWaitTillLoaded(
        this.api.launchUrl + '/#/files/public-files/' + token,
        this.page.FilesPageElement.filesList().elements.filesListProgressBar.selector
      )
    }
  }
}
