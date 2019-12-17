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
    /**
     * @param {string} filename
     * @param {string} status - It takes one of the following : declined, pending or '' for accepted
     * @param {string} user
     * Checks if the file-row of the desired file-name with the username consists of the desired status of accepted,
     * declined or pending
     */
    assertDesiredStatusIsPresent: async function (filename, status, user) {
      // TODO: Needs to be optimised
      await this.api.page.FilesPageElement.filesList().waitForFileVisible(filename)

      let requiredXpath = this.api.page.FilesPageElement.filesList().getFileRowSelectorByFileName(filename) +
                          util.format(this.elements.assertStatusFileRow.selector, status)
      requiredXpath = user === undefined ? requiredXpath : requiredXpath +
                      util.format(this.elements.getSharedFromUserName.selector, user)

      await this.waitForElementVisible({
        locateStrategy: this.elements.assertStatusFileRow.locateStrategy,
        selector: requiredXpath
      })

      return this
    },
    /**
     * @param {string} filename
     * @param {string} sharer
     * @param {string} status - It takes one of the following : declined, pending or '' for accepted
     * Checks if the file-row of the desired file-name with the username doesn't consist of the desired status of accepted,
     * declined or pending
     */
    assertDesiredStatusIsAbsent: function (filename, sharer, status) {
      let requiredXpath = this.api.page.FilesPageElement.filesList().getFileRowSelectorByFileName(filename) +
        util.format(this.elements.assertStatusFileRow.selector, status)
      requiredXpath = sharer === undefined ? requiredXpath : requiredXpath +
        util.format(this.elements.getSharedFromUserName.selector, sharer)
      return this.waitForElementNotPresent({
        locateStrategy: this.elements.assertStatusFileRow.locateStrategy,
        selector: requiredXpath
      })
    },
    /**
     * @param {string} filename
     * @param {string} action - It takes one of the following : Decline and Accept
     * @param {string} user
     *Performs required action, such as accept and decline, on the file row element of the desired file name
     *  shared by specific user
     */
    declineAcceptFile: function (action, filename, user) {
      const actionLocatorButton = {
        locateStrategy: this.elements.actionOnFileRow.locateStrategy,
        selector: this.api.page.FilesPageElement.filesList().getFileRowSelectorByFileName(filename) +
                  util.format(this.elements.getSharedFromUserName.selector, user) +
                  util.format(this.elements.actionOnFileRow.selector, action)
      }
      return this
        .initAjaxCounters()
        .waitForElementVisible(actionLocatorButton)
        .click(actionLocatorButton)
        .waitForOutstandingAjaxCalls()
    },
    /**
     * Asserts that the element(file/folder/resource) on the shared-with-me page is shared by the desired user
     *
     * @param {string} element
     * @param {string} sharer
     */
    assertSharedByUser: function (element, sharer) {
      const requiredXpath = this.api.page.FilesPageElement.filesList().getFileRowSelectorByFileName(element) +
                          util.format(this.elements.getSharedFromUserName.selector, sharer)
      return this.waitForElementVisible({
        locateStrategy: this.elements.getSharedFromUserName.locateStrategy,
        selector: requiredXpath
      })
    },
    isSharePresent: async function (element, sharer) {
      const requiredXpath = this.api.page.FilesPageElement.filesList().getFileRowSelectorByFileName(element) +
                          util.format(this.elements.getSharedFromUserName.selector, sharer)
      let shareFound = false
      await this.api.elements('xpath', requiredXpath, function (result) {
        shareFound = result.value.length > 0
      })
      return shareFound
    }
  },
  elements: {
    assertStatusFileRow: {
      selector: '//span[.="%s"]/../..',
      locateStrategy: 'xpath'
    },
    getSharedFromUserName: {
      selector: '//div[normalize-space(.)="%s"]',
      locateStrategy: 'xpath'
    },
    actionOnFileRow: {
      selector: '/../..//a[.="%s"]',
      locateStrategy: 'xpath'
    }
  }
}
