module.exports = {
  url: function () {
    return this.api.launchUrl + ''
  },
  commands: {
    /**
     *
     * @param {string} folder
     */
    navigateToFolder: function (folder) {
      return this.page.FilesPageElement.filesList().navigateToFolder(folder)
        .waitForElementVisible('@breadcrumb')
        .assert.containsText('@breadcrumb', folder)
    },
    /**
     *
     * @param {string} name
     * @param {boolean} expectToSucceed
     */
    createFolder: function (name, expectToSucceed = true) {
      this
        .waitForElementVisible('@newFileMenuButton', 500000)
        .click('@newFileMenuButton')
        .waitForElementVisible('@newFolderButton')
        .click('@newFolderButton')
        .waitForElementVisible('@newFolderInput')
        .setValue('@newFolderInput', name)
        .click('@newFolderOkButton')
        .waitForElementNotPresent('@createFolderLoadingIndicator')
      if (expectToSucceed) {
        this.waitForElementNotVisible('@newFolderDialog')
      }
      return this
    },
    /**
     *
     * @param {string} localFileName
     */
    uploadFile: function (localFileName) {
      return this
        .waitForElementVisible('@newFileMenuButton')
        .click('@newFileMenuButton')
        .waitForElementVisible('@fileUploadButton')
        .uploadLocalFile(
          '@fileUploadInput',
          require('path').join(this.api.globals.filesForUpload, localFileName)
        )
        .waitForElementVisible(
          '@fileUploadProgress',
          this.api.globals.waitForConditionTimeout,
          this.api.globals.waitForConditionPollInterval,
          false
        )
        .waitForElementNotVisible('@fileUploadProgress')
        .click('@newFileMenuButton')
    },
    showHiddenFiles: function () {
      return this
        .waitForElementVisible('@filterListButton')
        .click('@filterListButton')
        .waitForElementVisible('@hiddenFilesLabel')
        .click('@hiddenFilesCheckbox')
    },
    /**
     *
     * @param {string} fileOrFolder
     * @param {string} enableOrDisable
     */
    toggleFilterFileOrFolder: function (fileOrFolder, enableOrDisable) {
      let labelSelector, checkboxId
      if (fileOrFolder === 'folder') {
        labelSelector = '@filterFolderLabel'
        checkboxId = this.elements['filterFolderCheckbox']
      } else if (fileOrFolder === 'file') {
        labelSelector = '@filterFileLabel'
        checkboxId = this.elements['filterFileCheckbox']
      } else {
        throw new Error(`Expected 'file' or 'folder', ${fileOrFolder} given`)
      }
      return this
        .waitForElementVisible('@filterListButton')
        .click('@filterListButton')
        .waitForElementVisible(labelSelector)
        .toggleCheckbox(enableOrDisable, checkboxId)
        .click('@filterListButton')
    }
  },
  elements: {
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

    breadcrumb: {
      selector: '#files-breadcrumb li:nth-of-type(2)'
    },
    filterListButton: {
      selector: '#oc-filter-list-btn'
    },
    hiddenFilesLabel: {
      selector: '#oc-filter-hidden-label'
    },
    hiddenFilesCheckbox: {
      selector: '#oc-filter-hidden-checkbox'
    },
    filterFolderLabel: {
      selector: '#oc-filter-folder-label'
    },
    filterFolderCheckbox: {
      selector: '#oc-filter-folder-checkbox'
    },
    filterFileLabel: {
      selector: '#oc-filter-file-label'
    },
    filterFileCheckbox: {
      selector: '#oc-filter-file-checkbox'
    },
    createFolderLoadingIndicator: {
      selector: '//div[@id="new-folder-dialog"]//div[@class="oc-loader"]',
      locateStrategy: 'xpath'
    },
    fileUploadButton: {
      selector: '//span[@data-msgid="Upload"]',
      locateStrategy: 'xpath'
    },
    fileUploadInput: {
      selector: '#fileUploadInput'
    },
    fileUploadProgress: {
      selector: '#oc-progress-pie'
    }
  }
}
