module.exports = {
  url: function () {
    return this.api.launchUrl + '/#/files/list/home'
  },
  commands: {
    navigateToFolder: function (folder) {
      this.api.url(this.api.launchUrl + '/#/files/list/' + folder)
      return this.waitForElementNotPresent('@filesListProgressBar')
        .waitForElementVisible('@breadcrumb')
        .assert.containsText('@breadcrumb', folder)
    },
    waitForFileVisible: function (fileName) {
      var element = this.elements['fileRowByName']
      var util = require('util')
      var selector = util.format(element.selector, fileName)
      return this
        .useXpath()
        .waitForElementVisible(selector)
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
    }
  }
}
