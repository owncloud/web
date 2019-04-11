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
    waitForFileVisible: function (fileName) {
      var selector = this.getFileRowSelectorByFileName(fileName)
      return this
        .useXpath()
        .waitForElementVisible(selector)
        .useCss()
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
    filterListButton: {
      selector: '#filter-list-btn'
    },
    hiddenFilesLabel: {
      selector: '//li[text()="Hidden files"]',
      locateStrategy: 'xpath'
    },
    hiddenFilesCheckbox: {
      selector: '//li[text()="Hidden files"]/input',
      locateStrategy: 'xpath'
    },
    loadingIndicator: {
      selector: '//*[contains(@class, "oc-loader")]',
      locateStrategy: 'xpath'
    }
  }
}
