const util = require('util')
const { join } = require('../helpers/path')

module.exports = {
  url: function() {
    return join(this.api.launchUrl, '/#/files/list/shared-with-me/')
  },
  commands: {
    /**
     * like build-in navigate() but also waits till for the progressbar to appear and disappear
     * @returns {*}
     */
    navigateAndWaitTillLoaded: function() {
      return this.navigate(this.url()).waitForElementPresent(
        this.page.FilesPageElement.filesList().elements.anyAfterLoading
      )
    },
    /**
     * gets displayed share status of file-name (shared by user of given username)
     *
     * @param {string} filename
     * @param {string} user - The user who created the share
     *
     * @return {Promise<string>}
     */
    getShareStatusOfResource: async function(filename, user) {
      let status
      const requiredXpath =
        this.api.page.FilesPageElement.filesList().getFileRowSelectorByFileName(filename) +
        util.format(this.elements.getSharedFromUserName.selector, user) +
        this.elements.shareStatusOnFileRow.selector
      await this.useXpath()
        .waitForAnimationToFinish()
        .api.getText(requiredXpath, result => {
          if (result.status === 0) {
            status = result.value === '' ? 'Accepted' : result.value
          } else {
            throw new Error(
              `Expected: share status of the resource but found unexpected response: ${result.value.error}`
            )
          }
        })
        .useCss()
      return status
    },
    /**
     * @param {string} filename
     * @param {string} action - It takes one of the following : Decline and Accept
     * @param {string} user - The user who created the share
     *Performs required action, such as accept and decline, on the file row element of the desired file name
     *  shared by specific user
     */
    declineAcceptFile: function(action, filename, user) {
      const actionLocatorButton = {
        locateStrategy: this.elements.shareStatusActionOnFileRow.locateStrategy,
        selector:
          this.api.page.FilesPageElement.filesList().getFileRowSelectorByFileName(filename) +
          util.format(this.elements.getSharedFromUserName.selector, user) +
          util.format(this.elements.shareStatusActionOnFileRow.selector, action)
      }
      return this.waitForElementVisible(actionLocatorButton)
        .initAjaxCounters()
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
    getSharedByUser: async function(element) {
      let username
      const requiredXpath =
        this.api.page.FilesPageElement.filesList().getFileRowSelectorByFileName(element) +
        this.elements.sharedFrom.selector
      await this.waitForElementVisible({
        locateStrategy: this.elements.sharedFrom.locateStrategy,
        selector: requiredXpath
      })
      await this.api.getAttribute(
        this.elements.sharedFrom.locateStrategy,
        requiredXpath,
        'aria-label',
        result => {
          username = result.value
        }
      )
      return username
    },
    isSharePresent: async function(element, sharer) {
      const requiredXpath =
        this.api.page.FilesPageElement.filesList().getFileRowSelectorByFileName(element) +
        util.format(this.elements.getSharedFromUserName.selector, sharer)
      let shareFound = false
      await this.api.elements('xpath', requiredXpath, function(result) {
        shareFound = result.value.length > 0
      })
      return shareFound
    }
  },
  elements: {
    shareStatusOnFileRow: {
      selector:
        "/ancestor::tr[contains(@class, 'oc-tbody-tr')]//span[contains(@class,'file-row-share-status-text')]",
      locateStrategy: 'xpath'
    },
    getSharedFromUserName: {
      selector:
        '//td[contains(@class,"oc-table-data-cell-owner")]//span[@aria-label=normalize-space("%s")]',
      locateStrategy: 'xpath'
    },
    sharedFrom: {
      // ugly hack: oc-avatar has a parent div.oc-avatar-group, which is also matched by `contains(@class, 'oc-avatar')`.
      // to solve this we try matching on the class surrounded by blanks, which is not matching the oc-avatar-group anymore.
      selector:
        "//td[contains(@class,'oc-table-data-cell-owner')]//span[contains(concat(' ', normalize-space(@class), ' '), ' oc-avatar ')]",
      locateStrategy: 'xpath'
    },
    shareStatusActionOnFileRow: {
      selector:
        '/ancestor::tr[contains(@class, "oc-tbody-tr")]//button[contains(@class,"file-row-share-status-action")][normalize-space(.)="%s"]',
      locateStrategy: 'xpath'
    }
  }
}
