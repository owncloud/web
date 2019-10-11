const util = require('util')
const path = require('path')
const xpathHelper = require('../../helpers/xpath')

module.exports = {
  commands: {
    /**
     * perform one of the main file actions
     * this method does find out itself if the file-action burger has to be clicked or not
     *
     * @param {string} fileName
     * @param {string} delete|share|rename
     * @returns {*}
     */
    performFileAction: function (fileName, action) {
      const btnSelectorHighResolution = '(' + this.getFileRowSelectorByFileName(fileName) +
        this.elements[action + 'ButtonInFileRow'].selector + ')[1]'
      const btnSelectorLowResolution = '(' + this.getFileRowSelectorByFileName(fileName) +
        this.elements[action + 'ButtonInFileRow'].selector + ')[last()]'
      const fileActionsBtnSelector = this.getFileRowSelectorByFileName(fileName) +
        this.elements.fileActionsButtonInFileRow.selector

      return this.initAjaxCounters()
        .useXpath()
        .isVisible(fileActionsBtnSelector, (result) => {
          if (result.value === true) {
            this
              .click(fileActionsBtnSelector)
              .waitForElementVisible(btnSelectorLowResolution)
              .click(btnSelectorLowResolution)
          } else {
            this
              .waitForElementVisible(btnSelectorHighResolution)
              .click(btnSelectorHighResolution)
          }
        })
    },
    /**
     *
     * @param {string} fileName
     */
    deleteFile: function (fileName) {
      return this.initAjaxCounters()
        .waitForFileVisible(fileName)
        .useXpath()
        .performFileAction(fileName, 'delete')
        .waitForElementVisible('@deleteFileConfirmationBtn')
        .waitForAnimationToFinish()
        .click('@deleteFileConfirmationBtn')
        .waitForElementNotVisible('@deleteFileConfirmationDialog')
        .waitForOutstandingAjaxCalls()
        .useCss()
    },
    /**
     *
     * @param {string} fileName
     */
    restoreFile: function (fileName) {
      return this.initAjaxCounters()
        .waitForFileVisible(fileName)
        .useXpath()
        .performFileAction(fileName, 'restore')
        .waitForElementNotPresent(this.getFileRowSelectorByFileName(fileName))
    },
    /**
     *
     * @param {string} folder
     */
    navigateToFolder: function (folder) {
      this.waitForFileVisible(folder)
      return this.useXpath()
        .moveToElement(this.getFileRowSelectorByFileName(folder), 0, 0)
        .click(this.getFileLinkSelectorByFileName(folder))
        .useCss()
        .waitForElementNotPresent('@filesListProgressBar')
    },

    /**
     *
     * @param {string} fileName
     */
    openSharingDialog: function (fileName) {
      this.waitForFileVisible(fileName)
        .useXpath()
        .performFileAction(fileName, 'share')
        .waitForElementVisible('@sharingSideBar')
        .useCss()
      return this.api.page.FilesPageElement.sharingDialog()
    },
    /**
     *
     * @param {string} fileName
     */
    openPublicLinkDialog: function (fileName) {
      this.waitForFileVisible(fileName)
        .useXpath()
        .performFileAction(fileName, 'share')
        .waitForElementVisible('@linkToPublicLinksTag')
        .click('@linkToPublicLinksTag')
        .waitForElementVisible('@publicLinkSideBar')
        .useCss()
      return this.api.page.FilesPageElement.publicLinksDialog()
    },
    closeSidebar: function (timeout = null) {
      if (timeout === null) {
        timeout = this.api.globals.waitForConditionTimeout
      } else {
        timeout = parseInt(timeout, 10)
      }
      try {
        this.click({ selector: '@sidebarCloseBtn', timeout: timeout })
      } catch (e) {
        // do nothing
      }
      return this.api.page.FilesPageElement.filesList()
    },
    /**
     *
     * @param {string} fromName
     * @param {string} toName
     * @param {boolean} expectToSucceed
     */
    renameFile: function (fromName, toName, expectToSucceed = true) {
      this.initAjaxCounters()
        .waitForFileVisible(fromName)
        .useXpath()
        .performFileAction(fromName, 'rename')
        .waitForElementVisible('@renameFileConfirmationBtn')
        .waitForAnimationToFinish()
        .clearValue('@renameFileInputField')
        .setValueBySingleKeys('@renameFileInputField', toName)
        .click('@renameFileConfirmationBtn')
        .waitForOutstandingAjaxCalls()
        .useCss()

      if (expectToSucceed) {
        this.waitForElementNotVisible('@renameFileConfirmationDialog')
      }

      return this
    },
    /**
     *
     * @param {string} path
     */
    markAsFavorite: function (path) {
      const favoriteIconButton = this.getFileRowSelectorByFileName(path) +
        this.elements.notMarkedFavoriteInFileRow.selector

      return this.initAjaxCounters()
        .waitForFileVisible(path)
        .useXpath()
        .click(favoriteIconButton)
        .waitForOutstandingAjaxCalls()
        .useCss()
    },
    /**
     *
     */
    checkAllFiles: function () {
      return this.initAjaxCounters()
        .waitForElementVisible('@filesTable')
        .waitForElementVisible('@checkBoxAllFiles')
        .click('@checkBoxAllFiles')
    },

    /**
     * Restores all the selected files/folders
     *
     */
    restoreSelected: function () {
      return this.initAjaxCounters()
        .waitForElementVisible('@restoreSelectedButton')
        .useXpath()
        .click('@restoreSelectedButton')
        .waitForOutstandingAjaxCalls()
    },

    /**
     * @param {string} path
     */
    unmarkFavorite: function (path) {
      const unFavoriteBtn = this.getFileRowSelectorByFileName(path) +
        this.elements.markedFavoriteInFileRow.selector

      return this.initAjaxCounters()
        .waitForFileVisible(path)
        .useXpath()
        .click(unFavoriteBtn)
        .waitForOutstandingAjaxCalls()
        .useCss()
    },
    /**
     * @param {string} item the file/folder to click
     */
    clickRow: function (item) {
      return this.initAjaxCounters()
        .waitForFileVisible(item)
        .useXpath()
        .click(this.getFileRowSelectorByFileName(item))
        .waitForOutstandingAjaxCalls()
        .useCss()
    },

    /**
     * Toggle enable or disable file/folder select checkbox
     *
     * @param {string} enableOrDisable
     * @param {string} path
     */
    toggleFileOrFolderCheckbox: function (enableOrDisable, path) {
      const fileCheckbox = this.getFileRowSelectorByFileName(path) +
        this.elements.checkboxInFileRow.selector

      return this
        .waitForFileVisible(path)
        .toggleCheckbox(enableOrDisable, fileCheckbox, 'xpath')
    },
    /**
     *
     * @param {string} path
     * @param {function(boolean)} callback - if the file is marked as favorite
     */
    isMarkedFavorite: function (path, callback) {
      const markedFavoriteIcon = this.getFileRowSelectorByFileName(path) +
        this.elements.markedFavoriteInFileRow.selector

      return this
        .waitForFileVisible(path)
        .useXpath()
        .isVisible(markedFavoriteIcon, (result) => {
          callback(result.value)
        })
        .useCss()
    },
    /**
     *
     * @param {string} fileName
     */
    waitForFileVisible: function (fileName) {
      const rowSelector = this.getFileRowSelectorByFileName(fileName)
      const linkSelector = this.getFileLinkSelectorByFileName(fileName)
      this
        .useXpath()
        .waitForElementVisible(rowSelector)
        .getAttribute(linkSelector, 'innerText', function (result) {
          this.assert.strictEqual(result.value.trim(), fileName, 'displayed file name not as expected')
        })
      return this.useCss()
    },
    /**
     *
     * @param {string} fileName
     *
     * @returns {string}
     */
    getFileRowSelectorByFileName: function (fileName) {
      const parts = path.parse(fileName)
      if (parts.ext) {
        // keep path of nested folders intact, just remove the extension at the end
        const filePathWithoutExt = parts.dir ? parts.dir + '/' + parts.name : parts.name
        const element = this.elements.fileRowByNameAndExtension
        return util.format(
          element.selector,
          xpathHelper.buildXpathLiteral(filePathWithoutExt),
          parts.ext
        )
      }

      const element = this.elements.fileRowByName
      return util.format(element.selector, xpathHelper.buildXpathLiteral(fileName))
    },
    /**
     *
     * @param {string} fileName
     */
    getFileLinkSelectorByFileName: function (fileName) {
      return this.getFileRowSelectorByFileName(fileName) +
        this.elements.fileLinkInFileRow.selector
    },
    /**
     *
     * @param {string} element
     */
    assertElementNotListed: function (element) {
      return this
        .waitForElementVisible('@filesTable')
        .useXpath()
        .waitForElementNotPresent('@loadingIndicator')
        .waitForElementNotPresent(this.getFileRowSelectorByFileName(element))
    },
    /**
     *
     * @param {string} element
     */
    assertElementListed: function (element) {
      return this
        .waitForElementVisible('@filesTable')
        .useXpath()
        .waitForElementNotPresent('@loadingIndicator')
        .waitForElementPresent(this.getFileRowSelectorByFileName(element))
    },
    /**
     *
     * @returns {Promise.<[]>} Array of files/folders element
     */
    allFileRows: async function () {
      this
        .waitForElementNotPresent('@filesListProgressBar')
        .waitForElementVisible({ selector: '@fileRows', abortOnFailure: false })
      return new Promise((resolve, reject) => {
        this.api.elements('css selector', this.elements.fileRows, function (result) {
          resolve(result)
        })
      })
    },

    copyPrivateLink: function () {
      return this
        .waitForElementVisible('@sidebar')
        .waitForElementVisible('@sidebarPrivateLinkIcon')
        .click('@sidebarPrivateLinkIcon')
        .waitForElementNotVisible('@sidebarPrivateLinkIcon')
        .waitForElementVisible('@sidebarPrivateLinkIconCopied')
        .waitForElementNotVisible('@sidebarPrivateLinkIconCopied')
        .waitForElementVisible('@sidebarPrivateLinkIcon')
    }
  },
  elements: {
    filesTable: {
      selector: '#files-list, #shared-with-list'
    },
    fileRows: {
      selector: 'tr.file-row'
    },
    loadingIndicator: {
      selector: '//*[contains(@class, "oc-loader")]',
      locateStrategy: 'xpath'
    },
    filesListProgressBar: {
      selector: '#files-list-progress'
    },
    fileActionsButtonInFileRow: {
      selector: '//button[@aria-label="show-file-actions"]',
      locateStrategy: 'xpath'
    },
    deleteFileConfirmationDialog: {
      selector: '#delete-file-confirmation-dialog'
    },
    deleteButtonInFileRow: {
      selector: '//button[@aria-label="Delete"]',
      locateStrategy: 'xpath'
    },
    restoreButtonInFileRow: {
      selector: '//span[.="Restore"]',
      locateStrategy: 'xpath'
    },
    deleteFileConfirmationBtn: {
      selector: '#oc-dialog-delete-confirm'
    },
    shareButtonInFileRow: {
      selector: '//button[@aria-label="Collaborators"]',
      locateStrategy: 'xpath'
    },
    renameFileConfirmationDialog: {
      selector: '#change-file-dialog'
    },
    renameButtonInFileRow: {
      selector: '//button[@aria-label="Rename"]',
      locateStrategy: 'xpath'
    },
    renameFileInputField: {
      selector: '//div[@id="change-file-dialog"]//input',
      locateStrategy: 'xpath'
    },
    renameFileConfirmationBtn: {
      selector: '#oc-dialog-rename-confirm'
    },
    fileRowByName: {
      selector: '//span[@class="oc-file-name"][text()=%s and not(../span[@class="oc-file-extension"])]/../../..'
    },
    fileRowByNameAndExtension: {
      selector: '//span[span/text()=%s and span/text()="%s"]/../..'
    },
    fileLinkInFileRow: {
      selector: '//span[contains(@class, "file-row-name")]'
    },
    notMarkedFavoriteInFileRow: {
      selector: '//span[contains(@class, "oc-star-dimm")]',
      locateStrategy: 'xpath'
    },
    markedFavoriteInFileRow: {
      selector: '//span[contains(@class, "oc-star-shining")]',
      locateStrategy: 'xpath'
    },
    sharingSideBar: {
      selector: '#oc-files-sharing-sidebar'
    },
    publicLinkSideBar: {
      selector: '#oc-files-file-link'
    },
    checkBoxAllFiles: {
      selector: '#filelist-check-all'
    },
    checkboxInFileRow: {
      selector: '//input[@type="checkbox"]',
      locateStrategy: 'xpath'
    },
    restoreSelectedButton: {
      selector: '//span[contains(text(),"Restore selected")]',
      locateStrategy: 'xpath'
    },
    linkToPublicLinksTag: {
      selector: '//div[@class="sidebar-container"]//a[normalize-space(.)="Links"]',
      locateStrategy: 'xpath'
    },
    sidebarCloseBtn: {
      selector: '//div[@class="sidebar-container"]//div[@class="action"]//button',
      locateStrategy: 'xpath'
    },
    sidebar: {
      selector: '#files-sidebar'
    },
    sidebarPrivateLinkIcon: {
      selector: '#files-sidebar-private-link-icon'
    },
    sidebarPrivateLinkIconCopied: {
      selector: '#files-sidebar-private-link-icon-copied'
    }
  }
}
