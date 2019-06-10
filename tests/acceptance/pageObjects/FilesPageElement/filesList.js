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
        this.elements['fileActionsButtonInFileRow'].selector

      return this.initAjaxCounters()
        .useXpath()
        .moveToElement(this.getFileRowSelectorByFileName(fileName), 0, 0)
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
        .setValue('@renameFileInputField', toName)
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
        this.elements['notMarkedFavoriteInFileRow'].selector

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
    unmarkFavorite: function (path) {
      const unFavoriteBtn = this.getFileRowSelectorByFileName(path) +
        this.elements['markedFavoriteInFileRow'].selector

      return this.initAjaxCounters()
        .waitForFileVisible(path)
        .useXpath()
        .click(unFavoriteBtn)
        .waitForOutstandingAjaxCalls()
        .useCss()
    },
    /**
     *
     * @param {string} path
     * @param {function(boolean)} callback - if the file is marked as favorite
     */
    isMarkedFavorite: function (path, callback) {
      const markedFavoriteIcon = this.getFileRowSelectorByFileName(path) +
        this.elements['markedFavoriteInFileRow'].selector

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
        .expect.element(linkSelector).text.to.equal(fileName)
      return this.useCss()
    },
    /**
     *
     * @param {string} fileName
     *
     * @returns {string}
     */
    getFileRowSelectorByFileName: function (fileName) {
      var element = this.elements['fileRowByName']
      var util = require('util')
      if (fileName.indexOf('"') > -1) {
        element.selector = element.selector.replace(/"/g, "'")
      }
      return util.format(element.selector, fileName)
    },
    /**
     *
     * @param {string} fileName
     */
    getFileLinkSelectorByFileName: function (fileName) {
      return this.getFileRowSelectorByFileName(fileName) +
        this.elements['fileLinkInFileRow'].selector
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
     * @param {function} callback
     */
    allFileRows: function (callback) {
      this.api.elements('css selector', this.elements['fileRows'], function (result) {
        callback(result)
      })
    }
  },
  elements: {
    filesTable: {
      selector: '#files-list'
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
    deleteFileConfirmationBtn: {
      selector: '#oc-dialog-delete-confirm'
    },
    shareButtonInFileRow: {
      selector: '//button[@aria-label="Share"]',
      locateStrategy: 'xpath'
    },
    renameFileConfirmationDialog: {
      selector: '#change-file-dialog'
    },
    renameButtonInFileRow: {
      selector: '//button[@aria-label="Edit"]',
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
      selector: '//span[contains(@class, "file-row-name")][@filename="%s"]/../..'
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
    }
  }
}
