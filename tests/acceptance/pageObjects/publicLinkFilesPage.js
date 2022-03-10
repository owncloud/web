const { join } = require('../helpers/path')
const util = require('util')

module.exports = {
  url: function () {
    return join(this.api.launchUrl, '/files/ops/resolver/public-link/')
  },
  commands: {
    /**
     * like build-in navigate() but also waits till for the progressbar to appear and disappear
     * @returns {*}
     */
    navigateAndWaitTillLoaded: function (token) {
      return this.navigate(join(this.url(), token)).waitForElementPresent(
        this.page.FilesPageElement.filesList().elements.anyAfterLoading
      )
    },
    navigateAndWaitForPasswordPage: function (token) {
      this.navigate(join(this.api.launchUrl, '/files/ops/resolver/public-link', token))
      return this.page.publicLinkPasswordPage().waitForElementPresent('@passwordInput')
    },
    /**
     * It is not reliably possible to determine if it's a public link.
     * This checks for combination of files-list, and absence of hamburger menu
     * to determine this is a public links page
     *
     * @return {Promise<boolean>}
     */
    waitForPage: function () {
      const menuButton = this.page.webPage().elements.menuButton
      return this.api
        .waitForElementPresent(this.elements.filesListContainer.selector)
        .useStrategy(menuButton)
        .assert.elementNotPresent(menuButton)
        .useCss()
    },
    /**
     * navigates to the root directory of the link share
     * @param {string} linkName
     *
     * @returns {*}
     */
    navigateToRootFolder: function (linkName) {
      if (!linkName) {
        linkName = 'Public link'
      }
      const linkNameSelector = {
        selector: util.format(this.elements.linkName.selector, linkName),
        locateStrategy: 'xpath'
      }
      return this.waitForElementVisible(linkNameSelector).click(linkNameSelector)
    }
  },
  elements: {
    filesListContainer: {
      selector: '#files-list-container',
      locateStrategy: 'css selector'
    },
    linkName: {
      selector: '//li[@class="oc-breadcrumb-list-item"]//span[text()="%s"]'
    }
  }
}
