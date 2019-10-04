const util = require('util')
const navigationHelper = require('../helpers/navigationHelper')

module.exports = {
  url: function () {
    return this.api.launchUrl + ''
  },
  commands: {
    /**
     * like build-in navigate() but also waits till for the progressbar to appear and disappear
     * @param {string} folder - if given navigate to the folder without clicking the links
     * @returns {*}
     */
    navigateAndWaitTillLoaded: function (folder = '') {
      return navigationHelper.navigateAndWaitTillLoaded(
        this.api.launchUrl + '/#/files/list/' + folder,
        this.page.FilesPageElement.filesList().elements.filesListProgressBar.selector
      )
    },
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
     * Create a folder with the given name
     *
     * @param {string} name to set or null to use default value from dialog
     * @param {boolean} expectToSucceed
     */
    createFolder: function (name, expectToSucceed = true) {
      this
        .waitForElementVisible('@newFileMenuButton', 500000)
        .click('@newFileMenuButton')
        .waitForElementVisible('@newFolderButton')
        .click('@newFolderButton')
        .waitForElementVisible('@newFolderInput')
      if (name !== null) {
        this.clearValueWithEvent('@newFolderInput')
        this.setValueBySingleKeys('@newFolderInput', name)
      }
      this
        .click('@newFolderOkButton')
        .waitForElementNotPresent('@createFolderLoadingIndicator')
      if (expectToSucceed) {
        this.waitForElementNotVisible('@newFolderDialog')
          .waitForAnimationToFinish()
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
        .waitForElementNotPresent('@fileUploadProgress')
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
        checkboxId = this.elements.filterFolderCheckbox
      } else if (fileOrFolder === 'file') {
        labelSelector = '@filterFileLabel'
        checkboxId = this.elements.filterFileCheckbox
      } else {
        throw new Error(`Expected 'file' or 'folder', ${fileOrFolder} given`)
      }
      return this
        .waitForElementVisible('@filterListButton')
        .click('@filterListButton')
        .waitForElementVisible(labelSelector)
        .toggleCheckbox(enableOrDisable, checkboxId)
        .click('@filterListButton')
    },
    deleteAllCheckedFiles: function () {
      return this
        .waitForElementVisible('@deleteSelectedButton')
        .click('@deleteSelectedButton')
        .waitForElementVisible('@deleteFileConfirmationBtn')
        .waitForAnimationToFinish()
        .click('@deleteFileConfirmationBtn')
        .waitForElementNotVisible('@deleteFileConfirmationDialog')
        .waitForAnimationToFinish()
    },
    /**
     * return the complete xpath of the link to the specified tab in the side-bad
     * @param tab
     * @returns {string}
     */
    getXpathOfLinkToTabInSidePanel: function (tab) {
      return this.elements.sideBar.selector +
        util.format(this.elements.tabOfSideBar.selector, tab)
    },
    selectTabInSidePanel: function (tab) {
      return this
        .useXpath()
        .waitForElementVisible('@sideBar')
        .click(this.getXpathOfLinkToTabInSidePanel(tab))
        .useCss()
    },
    isSidebarVisible: function (callback) {
      return this
        .useXpath()
        .isVisible('@sideBar', (result) => {
          callback(result.value)
        })
        .useCss()
    },
    isPanelVisible: function (panelName, callback) {
      let selector = ''
      if (panelName === 'collaborators') {
        selector = this.page.FilesPageElement.sharingDialog().elements.sharingAutoComplete
      } else if (panelName === 'versions') {
        selector = this.elements.versionsPanel
      } else if (panelName === 'links') {
        selector = this.elements.linksPanel
      } else {
        throw new Error('invalid panel')
      }
      return this
        .isVisible(selector, (result) => {
          callback(result.value)
        })
    },
    copyPermalinkFromFilesAppBar: function () {
      return this
        .waitForElementVisible('@permalinkCopyButton')
        .click('@permalinkCopyButton')
    },
    checkSidebarItem: function (resourceName) {
      return this.getAttribute('@sidebarItemName', 'innerText', function (itemName) {
        this.assert.strictEqual(itemName.value, resourceName, `In sidebar is different item - ${itemName.value}`)
      })
    }
  },
  elements: {
    newFileMenuButton: {
      selector: '#new-file-menu-btn:enabled'
    },
    deleteSelectedButton: {
      selector: '#delete-selected-btn'
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
    permalinkCopyButton: {
      selector: '#files-permalink-copy'
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
      selector: '#files-file-upload-button'
    },
    fileUploadInput: {
      selector: '#fileUploadInput'
    },
    fileUploadProgress: {
      selector: '#files-upload-progress'
    },
    deleteFileConfirmationBtn: {
      selector: '#oc-dialog-delete-confirm'
    },
    deleteFileConfirmationDialog: {
      selector: '#delete-file-confirmation-dialog'
    },
    versionsPanel: {
      selector: '#oc-file-versions-sidebar'
    },
    linksPanel: {
      selector: '#oc-files-file-link'
    },
    sideBar: {
      selector: '//div[@class="sidebar-container"]',
      locateStrategy: 'xpath'
    },
    /**
     * path from inside the side-bar
     */
    tabOfSideBar: {
      // the translate bit is to make it case-insensitive
      selector: '//a[contains(translate(.,\'ABCDEFGHJIKLMNOPQRSTUVWXYZ\',\'abcdefghjiklmnopqrstuvwxyz\'),\'%s\')]',
      locateStrategy: 'xpath'
    },
    sidebarItemName: {
      selector: '#files-sidebar-item-name'
    }
  }
}
