const util = require('util')
const { join } = require('../helpers/path')
const { SHARE_STATE } = require('../helpers/sharingHelper')

module.exports = {
  url: function (viewMode) {
    return join(this.api.launchUrl, '/files/shares/with-me/?view-mode=' + viewMode)
  },
  commands: {
    /**
     * like build-in navigate() but also waits till for the progressbar to appear and disappear
     * @returns {*}
     */
    navigateAndWaitTillLoaded: function (viewMode = SHARE_STATE.accepted) {
      return this.navigate(this.url(viewMode)).waitForElementPresent(
        this.page.FilesPageElement.filesList().elements.anyAfterLoading
      )
    },
    /**
     * Navigate to the shared with me page in `accepted` view mode and wait until loading finished.
     * @returns {*}
     */
    navigateToAcceptedAndWaitUntilLoaded: function () {
      return this.navigateAndWaitTillLoaded(SHARE_STATE.accepted)
    },
    /**
     * Navigate to the shared with me page in `declined` view mode and wait until loading finished.
     * @returns {*}
     */
    navigateToDeclinedAndWaitUntilLoaded: function () {
      return this.navigateAndWaitTillLoaded(SHARE_STATE.declined)
    },
    /**
     * Checks if the share matching the given status, filename and owner is present on the given page.
     * Note: make sure that the view mode matching the given share status is loaded by navigating to
     * it first. See navigateToAcceptedAndWaitUntilLoaded and navigateToDeclinedAndWaitUntilLoaded.
     *
     * @param {string} status
     * @param {string} filename
     * @param {string} owner
     * @returns {Promise<boolean>}
     */
    hasShareStatusByFilenameAndUser: async function (status, filename, owner) {
      let selector =
        util.format(this.elements.shareTable.selector, status) +
        this.api.page.FilesPageElement.filesList().getFileRowSelectorByFileName(filename)
      if (owner) {
        selector += util.format(this.elements.shareOwnerName.selector, owner)
      }
      let isPresent = false
      await this.api.element('xpath', selector, function (result) {
        isPresent = !!(result.value && result.value.ELEMENT)
      })
      return isPresent
    },
    /**
     * Checks if the share matching the given status and filename is present on the given page.
     * Note: make sure that the view mode matching the given share status is loaded by navigating to
     * it first. See navigateToAcceptedAndWaitUntilLoaded and navigateToDeclinedAndWaitUntilLoaded.
     * Note: this function ignores the user who shared the file. The same file/foldername could
     * be shared by different users. In that case you need to use the more precise
     * `hasShareStatusByFilenameAndUser` instead.
     *
     * @param {string} status
     * @param {string} filename
     * @returns {Promise<boolean>}
     */
    hasShareStatusByFilename: async function (status, filename) {
      return await this.hasShareStatusByFilenameAndUser(status, filename, null)
    },
    batchDeclineShares: function () {
      return this.waitForElementVisible('@batchDeclineSharesButton')
        .initAjaxCounters()
        .click('@batchDeclineSharesButton')
        .waitForAjaxCallsToStartAndFinish()
    },
    /**
     * @param {string} filename
     * @param {string} action - It takes one of the following : Decline and Accept
     * @param {string} user - The user who created the share
     *Performs required action, such as accept and decline, on the file row element of the desired file name
     *  shared by specific user
     */
    declineAcceptFile: function (action, filename, user) {
      const actionLocatorButton = {
        locateStrategy: this.elements.shareStatusActionOnFileRow.locateStrategy,
        selector:
          this.api.page.FilesPageElement.filesList().getFileRowSelectorByFileName(filename) +
          util.format(this.elements.shareOwnerName.selector, user) +
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
    getSharedByUser: async function (element) {
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
        'data-test-user-name',
        (result) => {
          username = result.value
        }
      )
      return username
    },
    isSharePresent: async function (element, sharer) {
      const requiredXpath =
        this.api.page.FilesPageElement.filesList().getFileRowSelectorByFileName(element) +
        util.format(this.elements.shareOwnerName.selector, sharer)
      let shareFound = false
      await this.api.elements('xpath', requiredXpath, function (result) {
        shareFound = result.value.length > 0
      })
      return shareFound
    },
    unshareAllCheckedFiles: function () {
      return this.waitForElementVisible('@batchDeclineSharesButton')
        .click('@batchDeclineSharesButton')
        .waitForAjaxCallsToStartAndFinish()
    }
  },
  elements: {
    shareTable: {
      selector: '//table[@data-test-share-status="%s"]',
      locateStrategy: 'xpath'
    },
    shareOwnerName: {
      selector:
        '//td[contains(@class,"oc-table-data-cell-owner")]//span[@data-test-user-name="%s"]',
      locateStrategy: 'xpath'
    },
    sharedFrom: {
      // ugly hack: oc-avatar has a parent div.oc-avatars, which is also matched by `contains(@class, 'oc-avatar')`.
      // to solve this we try matching on the class surrounded by blanks, which is not matching the oc-avatars anymore.
      selector:
        "//td[contains(@class,'oc-table-data-cell-owner')]//span[contains(concat(' ', normalize-space(@class), ' '), ' oc-avatar ')]",
      locateStrategy: 'xpath'
    },
    shareStatusActionOnFileRow: {
      selector:
        '/ancestor::tr[contains(@class, "oc-tbody-tr")]//button[contains(@class,"file-row-share")][normalize-space(.)="%s"]',
      locateStrategy: 'xpath'
    },
    batchDeclineSharesButton: {
      selector: '.oc-files-actions-decline-share-trigger'
    }
  }
}
