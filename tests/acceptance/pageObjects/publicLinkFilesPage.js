module.exports = {
  commands: {
    /**
     * like build-in navigate() but also waits till for the progressbar to appear and disappear
     * @returns {*}
     */
    navigateAndWaitTillLoaded: function (token) {
      this.navigate(this.api.launchUrl + '/#/files/public-files/' + token)
      return this
        .page.FilesPageElement.filesList()
        .waitForElementPresent({ selector: '@filesListProgressBar', abortOnFailure: false }) // don't fail if we are too late
        .waitForElementNotPresent('@filesListProgressBar')
    }
  }
}
