module.exports = {
  url: function () {
    return this.api.launchUrl + '/#/files/list/home'
  },
  commands: {
    navigateToFolder: function (folder) {
      this.waitForFileVisible(folder)
      this.useXpath()
        .moveToElement(this.getFileRowSelectorByFileName(folder), 0, 0)
        .click(this.getFileLinkSelectorByFileName(folder))
        .useCss()
      return this.waitForElementNotPresent('@filesListProgressBar')
        .waitForElementVisible('@breadcrumb')
        .assert.containsText('@breadcrumb', folder)
    },
    createFolder: function (name, expectToSucceed = true) {
      this
        .waitForElementVisible('@newFileMenuButton', 500000)
        .click('@newFileMenuButton')
        .waitForElementVisible('@newFolderButton')
        .click('@newFolderButton')
        .waitForElementVisible('@newFolderInput')
        .setValue('@newFolderInput', name)
        .click('@newFolderOkButton')
        .waitForElementNotPresent('@loadingIndicator')
      if (expectToSucceed) {
        this.waitForElementNotVisible('@newFolderDialog')
      }
      return this
    },
    deleteFile: function (fileName) {
      const deleteBtnSelector = this.getFileRowSelectorByFileName(fileName) +
                                this.elements['deleteButtonInFileRow'].selector
      return this.initAjaxCounters()
        .waitForFileVisible(fileName)
        .useXpath()
        .moveToElement(this.getFileRowSelectorByFileName(fileName), 0, 0)
        .click(deleteBtnSelector)
        .waitForElementVisible('@deleteFileConfirmationBtn')
        .waitForAnimationToFinish()
        .click('@deleteFileConfirmationBtn')
        .waitForElementNotVisible('@deleteFileConfirmationDialog')
        .waitForOutstandingAjaxCalls()
        .useCss()
    },
    renameFile: function (fromName, toName) {
      const renameBtnSelector = this.getFileRowSelectorByFileName(fromName) +
        this.elements['renameButtonInFileRow'].selector
      return this.initAjaxCounters()
        .waitForFileVisible(fromName)
        .useXpath()
        .moveToElement(this.getFileRowSelectorByFileName(fromName), 0, 0)
        .click(renameBtnSelector)
        .waitForElementVisible('@renameFileConfirmationBtn')
        .waitForAnimationToFinish()
        .clearValue('@renameFileInputField')
        .setValue('@renameFileInputField', toName)
        .click('@renameFileConfirmationBtn')
        .waitForElementNotVisible('@renameFileConfirmationDialog')
        .waitForOutstandingAjaxCalls()
        .useCss()
    },
    waitForFileVisible: function (fileName) {
      const rowSelector = this.getFileRowSelectorByFileName(fileName)
      const linkSelector = this.getFileLinkSelectorByFileName(fileName)
      this
        .useXpath()
        .waitForElementVisible(rowSelector)
        .expect.element(linkSelector).text.to.equal(fileName)
      return this.useCss()
    },
    getFileRowSelectorByFileName: function (fileName) {
      var element = this.elements['fileRowByName']
      var util = require('util')
      if (fileName.indexOf('"') > -1) {
        element.selector = element.selector.replace(/"/g, "'")
      }
      return util.format(element.selector, fileName)
    },
    getFileLinkSelectorByFileName: function (fileName) {
      return this
        .getFileRowSelectorByFileName(fileName) +
          this.elements['fileLinkInFileRow'].selector
    },
    showHiddenFiles: function () {
      return this
        .useXpath()
        .click(this.elements['filterListButton'])
        .waitForElementVisible(this.elements['hiddenFilesLabel'])
        .click(this.elements['hiddenFilesCheckbox'])
        .useCss()
    },
    allFileRows: function (callback) {
      this.api.elements('css selector', this.elements['fileRows'], function (result) {
        callback(result)
      })
    },
    assertElementNotListed: function (element) {
      return this
        .waitForElementVisible('@filesTable')
        .useXpath()
        .waitForElementNotPresent('@loadingIndicator')
        .waitForElementNotPresent(this.getFileRowSelectorByFileName(element))
    }
  },
  elements: {
    filesTable: {
      selector: '#files-list'
    },
    fileRows: {
      selector: 'tr.file-row'
    },
    newFileMenuButton: {
      selector: '#new-file-menu-btn'
    },
    newFolderButton: {
      selector: '#new-folder-btn'
    },
    newFolderDialog: {
      selector: '#new-folder-dialog'
    },
    newFolderInput: {
      selector: '#new-folder-input'
    },
    newFolderOkButton: {
      selector: '#new-folder-ok'
    },
    filesListProgressBar: {
      selector: '#files-list-progress'
    },
    breadcrumb: {
      selector: '#files-breadcrumb li:nth-of-type(1)'
    },
    fileRowByName: {
      selector: '//a[contains(@class, "file-row-name")][@filename="%s"]/../..'
    },
    fileLinkInFileRow: {
      selector: '//a[contains(@class, "file-row-name")]'
    },
    deleteFileConfirmationDialog: {
      selector: '#delete-file-confirmation-dialog'
    },
    deleteButtonInFileRow: {
      selector: '//button[@aria-label="Delete"]',
      locateStrategy: 'xpath'
    },
    deleteFileConfirmationBtn: {
      selector: '//div[@id="delete-file-confirmation-dialog"]//button[@text="Ok"]',
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
      selector: '//div[@id="change-file-dialog"]//button[@text="Ok"]',
      locateStrategy: 'xpath'
    },
    filterListButton: {
      selector: '#filter-list-btn'
    },
    hiddenFilesLabel: {
      selector: '//li[text()="Hidden"]',
      locateStrategy: 'xpath'
    },
    hiddenFilesCheckbox: {
      selector: '//li[text()="Hidden"]/input',
      locateStrategy: 'xpath'
    },
    loadingIndicator: {
      selector: '//*[contains(@class, "oc-loader")]',
      locateStrategy: 'xpath'
    }
  }
}
