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
     * gets displayed share status of file-name (shared by user of given username)
     *
     * @param {string} filename
     * @param {string} sharer
     *
     * @return {Promise<string>}
     */
    getShareStatusOfResource: async function (filename, sharer) {
      let status
      const requiredXpath = this.api.page.FilesPageElement.filesList().getFileRowSelectorByFileName(filename) +
        util.format(this.elements.getSharedFromUserName.selector, sharer) +
        this.elements.shareStatusOnFileRow.selector
      await this
        .useXpath()
        .waitForAnimationToFinish()
        .api.getText(requiredXpath,
          (result) => {
            if (result.status === 0) {
              status = result.value === '' ? 'Accepted' : result.value
            } else {
              throw new Error(`Expected: share status of the resource but found unexpected response: ${result}`)
            }
          }
        )
        .useCss()
      return status
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
     * gets the username of user that the element(file/folder/resource) on the shared-with-me page is shared by
     *
     * @param {string} element
     *
     * @return {Promise<string>}
     */
    getSharedByUser: async function (element) {
      let username
      const requiredXpath = this.api.page.FilesPageElement.filesList().getFileRowSelectorByFileName(element) +
          this.elements.sharedFrom.selector
      await this.waitForElementVisible({
        locateStrategy: this.elements.sharedFrom.locateStrategy,
        selector: requiredXpath
      })
        .api.getText(
          this.elements.sharedFrom.locateStrategy,
          requiredXpath,
          (result) => {
            username = result.value
          }
        )
      return username
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
    shareStatusOnFileRow: {
      selector: "/../..//div[@class='uk-text-nowrap uk-width-small']/span",
      locateStrategy: 'xpath'
    },
    getSharedFromUserName: {
      selector: '//div[normalize-space(.)="%s"]',
      locateStrategy: 'xpath'
    },
    sharedFrom: {
      selector: "//div[@class='uk-text-meta uk-text-nowrap uk-width-small']/div",
      locateStrategy: 'xpath'
    },
    actionOnFileRow: {
      selector: '/../..//a[.="%s"]',
      locateStrategy: 'xpath'
    }
  }
}
