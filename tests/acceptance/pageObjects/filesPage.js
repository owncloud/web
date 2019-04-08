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
    showHiddenFiles: function () {
      return this
        .useXpath()
        .click(this.elements['filterListButton'])
        .waitForElementVisible(this.elements['hiddenFilesLabel'])
        .click(this.elements['hiddenFilesCheckbox'])
        .waitForElementNotVisible(this.elements['hiddenFilesLabel'])
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
      selector: '//a[contains(@class, "file-row-name")][@filename="%s"]'
    },
    filterListButton: {
      selector: '//div[@class="actionSlot"]//i[text()="filter_list"]',
      locateStrategy: 'xpath'
    },
    hiddenFilesLabel: {
      selector: '//div[contains(@class, "v-menu__content")]//div[text()="Hidden"]',
      locateStrategy: 'xpath'
    },
    hiddenFilesCheckbox: {
      selector: '//div[contains(@class, "v-menu__content")]//div[text()="Hidden"]/following-sibling::div//input/following-sibling::div',
      locateStrategy: 'xpath'
    }
  }
}
