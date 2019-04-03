module.exports = {
  url: function () {
    return this.api.launchUrl + '/#/files/list/home'
  },
  commands: {
    navigateToFolder: function (folder) {
      this.waitForFileVisible(folder)
      this.useXpath()
        .moveToElement(this.getFileRowSelectorByFileName(folder), 0, 0)
        .click(this.getFileRowSelectorByFileName(folder))
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
      selector: 'div.file-row:nth-of-type(2)'
    },
    newFileMenuButton: {
      selector: '#new-file-menu-btn'
    },
    newFolderButton: {
      selector: '#new-folder-btn'
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
      selector: '//*[contains(@id, "breadcrumb-")]',
      locateStrategy: 'xpath'
    },
    fileRowByName: {
      selector: '//div[contains(@class, "file-row-name")][text()="%s"]'
    }
  }
}
