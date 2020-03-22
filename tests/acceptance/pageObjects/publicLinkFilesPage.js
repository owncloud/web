const navigationHelper = require('../helpers/navigationHelper')
const { join } = require('../helpers/path')

module.exports = {
  commands: {
    /**
     * like build-in navigate() but also waits till for the progressbar to appear and disappear
     * @returns {*}
     */
    navigateAndWaitTillLoaded: function(token) {
      return navigationHelper.navigateAndWaitTillLoaded(
        join(this.api.launchUrl, '/#/files/public-files/', token),
        this.page.FilesPageElement.filesList().elements.filesListProgressBar
      )
    },
    navigateAndWaitForPasswordPage: function(token) {
      this.navigate(join(this.api.launchUrl, '/#/files/public-files/', token))
      return this.page.publicLinkPasswordPage().waitForElementPresent('@passwordInput')
    },
    /**
     * It is not reliably possible to determine if it's a public link.
     * This checks for combination of files-list, and absence of hamburger menu
     * to determine this is a public links page
     *
     * @return {Promise<boolean>}
     */
    waitForPage: function() {
      const menuButton = this.page.phoenixPage().elements.menuButton
      return this.api
        .waitForElementPresent(this.elements.filesListContainer.selector)
        .useStrategy(menuButton)
        .assert.elementNotPresent(menuButton)
        .useCss()
    }
  },
  elements: {
    filesListContainer: {
      selector: '#files-list-container',
      locateStrategy: 'css selector'
    }
  }
}
