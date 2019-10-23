const util = require('util')
const path = require('path')
const xpathHelper = require('../../helpers/xpath')

module.exports = {
  commands: {
    /**
     * Action button selector for Low Resolution screens
     *
     * @param {string} action
     * @param {string} fileName
     * @returns {string}
     */
    getActionSelectorLowRes: function (action, fileName) {
      return '(' + this.getFileRowSelectorByFileName(fileName) +
        this.elements[action + 'ButtonInFileRow'].selector + ')[last()]'
    },
    /**
     * Action button selector for High Resolution screens
     *
     * @param {string} action
     * @param {string} fileName
     * @returns {string}
     */
    getActionSelectorHighRes: function (action, fileName) {
      return '(' + this.getFileRowSelectorByFileName(fileName) +
        this.elements[action + 'ButtonInFileRow'].selector + ')[1]'
    },
    /**
     * Get Selector for File Actions expander
     *
     * @param fileName
     * @returns {string}
     */
    getFileActionBtnSelector: function (fileName) {
      return this.getFileRowSelectorByFileName(fileName) +
        this.elements.fileActionsButtonInFileRow.selector
    },
    /**
     * perform one of the main file actions
     * this method does find out itself if the file-action burger has to be clicked or not
     *
     * @param {string} fileName
     * @param {string} action delete|share|rename
     * @returns {*}
     */
    performFileAction: function (fileName, action) {
      const { btnSelectorHighResolution, btnSelectorLowResolution, fileActionsBtnSelector } =
        this.getFileRowButtonSelectorsByFileName(fileName, action)

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
     * Checks whether a given action is disabled for a given file name.
     * This method does find out itself if the file-action burger has to be clicked or not.
     *
     * @param {string} fileName
     * @param {string} delete|share|rename
     * @param {function(boolean)} callback - whether the action is disabled
     * @returns {*}
     */
    isActionDisabled: function (fileName, action, callback) {
      const { btnSelectorHighResolution, btnSelectorLowResolution, fileActionsBtnSelector } =
        this.getFileRowButtonSelectorsByFileName(fileName, action)

      return this
        .useXpath()
        .moveToElement(this.getFileRowSelectorByFileName(fileName), 0, 0)
        .isVisible(fileActionsBtnSelector, (result) => {
          let btnSelector
          if (result.value === true) {
            this
              .click(fileActionsBtnSelector)
            btnSelector = btnSelectorLowResolution
          } else {
            btnSelector = btnSelectorHighResolution
          }

          this
            .waitForElementVisible(btnSelector)
            .useXpath()
            .getAttribute(btnSelector, 'disabled', (disabledResult) => {
              const isDisabled = disabledResult.value === 'true'
              callback(isDisabled)
            })
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
        .waitForElementEnabled(
          this.elements.deleteFileConfirmationBtn.selector,
          this.elements.deleteFileConfirmationBtn.locateStrategy
        )
        .click('@deleteFileConfirmationBtn')
        .waitForCSSPropertyEquals(
          {
            selector: this.elements.deleteFileConfirmationDialog.selector,
            locateStrategy: this.elements.deleteFileConfirmationBtn.locateStrategy,
            property: 'display',
            value: 'none'
          }
        )
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
        this.click({
          selector: '@sidebarCloseBtn',
          timeout: timeout
        })
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
        // click in empty space in the tr using coordinates to avoid
        // clicking on other elements that might be in the front
        .clickElementAt(this.getFileRowSelectorByFileName(item), 0, 0)
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
    getFileRowButtonSelectorsByFileName: function (fileName, action) {
      const btnSelectorHighResolution = this.getActionSelectorHighRes(action, fileName)
      const btnSelectorLowResolution = this.getActionSelectorLowRes(action, fileName)
      const fileActionsBtnSelector = this.getFileActionBtnSelector(fileName)

      return { btnSelectorHighResolution, btnSelectorLowResolution, fileActionsBtnSelector }
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
    assertSharingIsDisabled: function (resource) {
      const resourceRowXpath = this.getFileRowSelectorByFileName(resource)
      const shareButtonXpath = this.elements.shareButtonInFileRow.selector
      const resourceShareButtonXpath = resourceRowXpath + shareButtonXpath
      return this
        .closeSidebar(100)
        .useXpath()
        .assert.elementNotPresent(resourceShareButtonXpath)
        .click(resourceRowXpath)
        .waitForElementVisible('@sidebar')
        .assert.elementNotPresent('@sidebarLinksTab')
        .assert.elementNotPresent('@sidebarCollaboratorsTab')
        .useCss()
    },
    /**
     * @param {string} action
     * @param {string} fileName
     * @returns {Promise}
     */
    assertActionDisabled: function (action, fileName) {
      const btnSelectorHighResolution = this.getActionSelectorHighRes(action, fileName)
      const btnSelectorLowResolution = this.getActionSelectorLowRes(action, fileName)
      const fileActionsBtnSelector = this.getFileActionBtnSelector(fileName)

      return this
        .useXpath()
        .moveToElement(this.getFileRowSelectorByFileName(fileName), 0, 0)
        .isVisible(fileActionsBtnSelector, (result) => {
          if (result.value === true) {
            this.click(fileActionsBtnSelector)
              .waitForElementVisible(btnSelectorLowResolution)
              .getAttribute(btnSelectorLowResolution, 'disabled', result => {
                this.assert.strictEqual(
                  result.value, 'true',
                  `expected property disabled of ${btnSelectorLowResolution} to be 'true' but found ${result.value}`)
              })
          } else {
            this.waitForElementVisible(btnSelectorHighResolution)
              .getAttribute(btnSelectorHighResolution, 'disabled', result => {
                this.assert.strictEqual(
                  result.value, 'true',
                  `expected property disabled of ${btnSelectorHighResolution} to be 'true' but found ${result.value}`)
              })
          }
        })
    },
    /**
     *
     * @returns {Promise.<[]>} Array of files/folders element
     */
    allFileRows: async function () {
      this
        .waitForElementNotPresent('@filesListProgressBar')
        .waitForElementVisible({
          selector: '@fileRows',
          abortOnFailure: false
        })
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
    },
    deleteImmediately: function (fileName) {
      return this.waitForFileVisible(fileName)
        .performFileAction(fileName, 'deleteImmediately')
        .waitForElementVisible('@deleteFileConfirmationBtn')
        .click('@deleteFileConfirmationBtn')
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
      selector: '#delete-file-confirmation-dialog',
      locateStrategy: 'css selector'
    },
    deleteButtonInFileRow: {
      selector: '//button[@aria-label="Delete"]',
      locateStrategy: 'xpath'
    },
    restoreButtonInFileRow: {
      selector: '//span[.="Restore"]',
      locateStrategy: 'xpath'
    },
    deleteImmediatelyButtonInFileRow: {
      selector: '//span[.="Delete immediately"]',
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
    },
    sidebarLinksTab: {
      selector: '//div[@class="sidebar-container"]//a[contains(text(),"Links")]',
      locateStrategy: 'xpath'
    },
    sidebarCollaboratorsTab: {
      selector: '//div[@class="sidebar-container"]//a[contains(text(),"Collaborators")]',
      locateStrategy: 'xpath'
    }
  }
}
