const util = require('util')
const xpathHelper = require('../helpers/xpath')
const { join, normalize } = require('../helpers/path')
const { client } = require('nightwatch-api')

module.exports = {
  url: function () {
    return join(this.api.launchUrl, '#/files/list/all')
  },
  commands: {
    /**
     * like build-in navigate() but also waits till for the progressbar to appear and disappear
     * @param {string} folder - if given navigate to the folder without clicking the links
     * @returns {*}
     */
    navigateAndWaitTillLoaded: async function (folder = '') {
      return await this.navigate(join(this.url(), folder)).waitForElementPresent(
        this.page.FilesPageElement.filesList().elements.anyAfterLoading
      )
    },
    /**
     *
     * @param {string} folder
     */
    navigateToFolder: function (folder) {
      return this.page.FilesPageElement.filesList()
        .navigateToFolder(folder)
        .waitForElementVisible('@breadcrumb')
        .assert.containsText('@breadcrumb', folder)
    },
    /**
     *
     * @param {string} resource
     */
    navigateToBreadcrumb: function (resource) {
      const breadcrumbElement = this.elements.resourceBreadcrumb
      const resourceXpath = util.format(
        breadcrumbElement.selector,
        xpathHelper.buildXpathLiteral(resource)
      )
      return this.useStrategy(breadcrumbElement)
        .waitForElementVisible(resourceXpath)
        .click(resourceXpath)
        .useCss()
    },
    /**
     * Gets the breadcrumb element selector for the provided combination of clickable
     * and non-clickable breadcrumb segments.
     * Note: the combination (false,false) is invalid.
     *
     * @param clickable Whether a clickable breadcrumb is wanted
     * @param nonClickable Whether a non-clickable breadcrumb is wanted
     * @returns {null|{locateStrategy: string, selector: string}}
     */
    getBreadcrumbSelector: function (clickable, nonClickable) {
      if (clickable) {
        return this.elements.resourceBreadcrumb
      } else if (nonClickable) {
        return this.elements.resourceBreadcrumbNonClickable
      }
      return null
    },
    /**
     * Create a folder with the given name
     *
     * @param {string} name to set or null to use default value from dialog
     * @param {boolean} expectToSucceed
     */
    createFolder: async function (name, expectToSucceed = true) {
      await this.clearFileSelectionIfAny()
      await this.waitForElementVisible('@newFileMenuButtonAnyState')
        .waitForElementEnabled('@newFileMenuButtonAnyState')
        .click('@newFileMenuButton')
        .click('@newFolderButton')
        .waitForElementVisible('@dialog')
        .waitForAnimationToFinish() // wait for transition on the modal to finish

      if (name !== null) {
        await this.clearValueWithEvent('@dialogInput')
        await this.setValue('@dialogInput', name)
      }

      await this.click('@dialogConfirmBtnEnabled').waitForAjaxCallsToStartAndFinish()

      if (expectToSucceed) {
        await this.waitForElementNotPresent('@dialog')
      } else {
        await this.waitForElementPresent('@dialogBoxInputTextInRed')
          // checking if the button is disabled
          .waitForElementPresent('@dialogConfirmBtnDisabled')
      }

      return this
    },
    /**
     * Create a file with the given name
     *
     * @param {string} name to set or null to use default value from dialog
     * @param {boolean} expectToSucceed
     */
    createFile: async function (name, expectToSucceed = true) {
      await this.clearFileSelectionIfAny()
      await this.waitForElementVisible('@newFileMenuButton')
        .click('@newFileMenuButton')
        .waitForElementVisible('@newFileButton')
        .click('@newFileButton')
        .waitForElementVisible('@dialog')
        .waitForAnimationToFinish() // wait for transition on the modal to finish

      if (name !== null) {
        await this.clearValueWithEvent('@dialogInput')
        await this.setValue('@dialogInput', name)
      }

      await this.click('@dialogConfirmBtnEnabled')

      if (expectToSucceed) {
        await this.waitForElementNotPresent('@dialog')
      } else {
        await this.waitForElementPresent('@dialogBoxInputTextInRed')
          // checking if the button is disabled
          .waitForElementPresent('@dialogConfirmBtnDisabled')
      }

      return this
    },
    selectFileForUpload: function (filePath) {
      return this.waitForElementVisible('@uploadFilesButton')
        .click('@uploadFilesButton')
        .waitForElementVisible('@fileUploadButton')
        .setValue('@fileUploadInput', filePath)
    },
    /**
     *
     * @param {string} filePath
     */
    uploadFile: function (filePath) {
      return this.selectFileForUpload(filePath)
        .waitForElementVisible(
          '@fileUploadProgress',
          this.api.globals.waitForNegativeConditionTimeout,
          this.api.globals.waitForConditionPollInterval,
          false
        )
        .waitForElementNotVisible('@fileUploadProgress')
        .click('@newFileMenuButton')
    },
    /**
     * This uploads a folder that is inside the selenium host,
     * not from the server, web or where the test runner is located.
     * So, the folder needs to be already there on the machine where the browser is running.
     *
     * @typedef {import('../customCommands/uploadRemote')} UploadRemote
     * We can extract the folder path from the callback of
     * [uploadRemote()]{@link UploadRemote.command}, which is similar to the following:
     * `/tmp/545cfb7e4b6e6603b2bbef4d69f82627/upload1734400381952243704file/new-lorem.txt`.
     * Extract `upload1734400381952243704file` and send it as arg here, otherwise, the whole
     * `/tmp/<sessionID>` folder will get uploaded
     *
     * @see below for working information
     *
     * @param {string} [folderName] - should be passed in as format "/upload<uniqueId>file" or "upload<uniqueId>file"
     */
    uploadSessionFolder: function (folderName = '') {
      /*
      files uploaded through selenium endpoints are saved in
      /tmp/<sessionId>/upload<uniqueId>file/<filename>.

      So, we are trying to upload the "/tmp/<sessionId>" (or, if the folderName is set, it's "/tmp/<sessionId>/<folderName>")
      folder through web, by setting value on folder input field to that folder, and hopefully,
      web gets the `onChange` event and uploads that folder.
       */
      const sessionId = this.api.sessionId
      folderName = normalize(folderName)
      folderName = `/tmp/${sessionId}/${folderName}`
      return this.uploadFolder(folderName)
    },

    /**
     * Upload folder which is inside selenium
     *
     * @param {string} folderName
     */
    uploadFolder: function (folderName) {
      return this.waitForElementVisible('@uploadFilesButton')
        .click('@uploadFilesButton')
        .waitForElementVisible('@fileUploadButton')
        .setValue('@folderUploadInput', folderName)
        .waitForElementVisible(
          '@fileUploadProgress',
          this.api.globals.waitForNegativeConditionTimeout,
          this.api.globals.waitForConditionPollInterval,
          false
        )
        .waitForElementNotVisible('@fileUploadProgress')
        .click('@uploadFilesButton')
    },
    /**
     * Returns whether files or folders can be created in the current page.
     */
    canCreateFiles: async function () {
      let canCreate = false
      await this.waitForElementVisible('@newFileMenuButtonAnyState').getAttribute(
        '@newFileMenuButtonAnyState',
        'disabled',
        (result) => {
          canCreate = result.value === 'true'
        }
      )
      return canCreate
    },
    deleteAllCheckedFiles: function () {
      return this.waitForElementVisible('@deleteSelectedButton')
        .click('@deleteSelectedButton')
        .waitForElementVisible('@dialog')
        .waitForAnimationToFinish() // wait for transition on the modal to finish
        .click('@dialogConfirmBtnEnabled')
        .waitForAjaxCallsToStartAndFinish()
        .waitForElementNotPresent('@dialog')
    },
    confirmFileOverwrite: async function () {
      await this.waitForAnimationToFinish() // wait for transition on the modal to finish
        .click('@dialogConfirmBtnEnabled')
        .waitForElementNotPresent('@dialog')
        .waitForAjaxCallsToStartAndFinish()
      return this
    },
    checkForButtonDisabled: function () {
      return this.waitForElementVisible('@dialogConfirmBtnDisabled')
    },

    moveMultipleResources: async function (target) {
      // Trigger move
      await this.click('@moveSelectedBtn')

      // Execute move
      return await client.page.locationPicker().selectFolderAndConfirm(target)
    },

    copyMultipleResources: async function (target) {
      // Trigger copy
      await this.click('@copySelectedBtn')

      // Execute copy
      return await client.page.locationPicker().selectFolderAndConfirm(target)
    },

    /**
     * Create a md file with the given name
     *
     * @param {string | null} name to set or null to use default value from dialog
     * @param {boolean} expectToSucceed
     */
    createMarkdownFile: async function (name, expectToSucceed = true) {
      await this.waitForElementVisible('@newFileMenuButton')
        .click('@newFileMenuButton')
        .waitForElementVisible('@newMdFileButton')
        .click('@newMdFileButton')
        .waitForElementVisible('@dialog')

      if (name !== null) {
        await this.clearValueWithEvent('@dialogInput')
        await this.setValue('@dialogInput', name)
      }

      await this.initAjaxCounters().click('@dialogConfirmBtnEnabled').waitForOutstandingAjaxCalls()

      if (expectToSucceed) {
        await this.waitForElementNotPresent('@dialog')
      }

      return this
    },
    closeTextEditor: function () {
      return this.waitForElementVisible('@editorCloseBtn').click('@editorCloseBtn')
    },
    isRootDirectory: async function () {
      return await this.assert.not.elementPresent('@breadcrumb')
    },
    isSearchBarVisible: async function () {
      let searchBar
      await this.api.elements('@searchInput', (result) => {
        searchBar = result.value
      })
      return searchBar.length > 0
    },
    clearSelection: async function () {
      await this.useXpath()
        .waitForElementVisible('@clearSelectionBtn')
        .click('@clearSelectionBtn')
        .waitForElementNotPresent('@clearSelectionBtn')
    },
    checkForButtonMoveHereDisabled: function () {
      return this.waitForElementVisible('@moveHereConfirmBtn')
    },
    clearFileSelectionIfAny: async function () {
      let activeFileSelection = false
      await this.isVisible(
        {
          selector: '@clearSelectionBtn',
          timeout: client.globals.waitForNegativeConditionTimeout
        },
        (result) => {
          activeFileSelection = result.value === true
        }
      )
      if (activeFileSelection) {
        await this.click('@clearSelectionBtn').waitForElementNotPresent('@clearSelectionBtn')
      }
      return this
    }
  },
  elements: {
    searchInput: {
      selector: 'input.oc-search-input'
    },
    uploadFilesButton: {
      selector: '#upload-menu-btn'
    },
    newFileMenuButtonAnyState: {
      selector: '#new-file-menu-btn'
    },
    newFileMenuButton: {
      selector: '#new-file-menu-btn:enabled'
    },
    // covers oc-files-actions-delete-permanent-trigger and oc-files-actions-delete-trigger
    deleteSelectedButton: {
      selector: '//button[contains(@class, "oc-files-actions-delete-")]',
      locateStrategy: 'xpath'
    },
    newResourceDropdown: {
      selector: '#new-file-menu-drop'
    },
    newFolderButton: {
      selector: '#new-folder-btn'
    },
    newFileButton: {
      selector: '#new-file-menu-drop .new-file-btn-txt'
    },
    newMdFileButton: {
      selector: '#new-file-menu-drop .new-file-btn-md'
    },
    newFolderInput: {
      selector: '#new-folder-input'
    },
    newFileInput: {
      selector: '#new-file-input'
    },
    breadcrumb: {
      selector: '#files-breadcrumb li:nth-of-type(2)'
    },
    breadcrumbMobile: {
      selector: '//span[@class="oc-breadcrumb-drop-label-text" and text()=%s]',
      locateStrategy: 'xpath'
    },
    breadcrumbMobileReferencedToOpenSidebarButton: {
      selector:
        '//button[@aria-label="Open sidebar to view details"]/ancestor::div//span[@class="oc-breadcrumb-drop-label-text" and text()=%s]',
      locateStrategy: 'xpath'
    },
    resourceBreadcrumb: {
      selector:
        '//nav[@id="files-breadcrumb"]//*[(self::a or self::button)]/span[contains(text(),%s)]',
      locateStrategy: 'xpath'
    },
    resourceBreadcrumbNonClickable: {
      selector: '//nav[@id="files-breadcrumb"]//span[contains(text(),%s)]',
      locateStrategy: 'xpath'
    },
    fileUploadButton: {
      selector: '#files-file-upload-button'
    },
    fileUploadInput: {
      selector: '#fileUploadInput'
    },
    folderUploadInput: {
      selector: '#folderUploadInput'
    },
    fileUploadProgress: {
      selector: '#files-upload-progress'
    },
    dialog: {
      selector: '.oc-modal'
    },
    dialogConfirmBtnEnabled: {
      selector: '.oc-modal-body-actions-confirm:enabled'
    },
    dialogConfirmBtnDisabled: {
      selector: '.oc-modal-body-actions-confirm:disabled'
    },
    dialogCancelBtn: {
      selector: '.oc-modal-body-actions-cancel'
    },
    dialogInput: {
      selector: '.oc-modal-body-input .oc-text-input'
    },
    moveSelectedBtn: {
      selector: '.oc-files-actions-move-trigger'
    },
    copySelectedBtn: {
      selector: '.oc-files-actions-copy-trigger'
    },
    editorCloseBtn: {
      selector: '#markdown-editor-app-bar .oc-text-right .oc-button'
    },
    clearSelectionBtn: {
      selector: '#files-clear-selection'
    },
    dialogBoxInputTextInRed: {
      selector: '.oc-text-input-danger'
    },
    moveHereConfirmBtn: {
      selector: '#location-picker-btn-confirm:disabled'
    }
  }
}
