const util = require('util')
const assert = require('assert')
const xpathHelper = require('../../helpers/xpath')
const { client } = require('nightwatch-api')
const appSideBar = client.page.FilesPageElement.appSideBar()
const contextMenu = client.page.FilesPageElement.contextMenu()
const filesRow = client.page.FilesPageElement.filesRow()
const fileActionsMenu = client.page.FilesPageElement.fileActionsMenu()

module.exports = {
  commands: {
    /**
     * @param resource
     * @returns {Promise<void>}
     */
    openDetailsDialog: async function (resource) {
      await this.openSideBar(resource)
      await appSideBar.activatePanel('details')
    },
    /**
     * @param {string} resource
     * @return {Promise<*>}
     */
    openSharingDialog: async function (resource) {
      await this.openSideBar(resource)
      await appSideBar.activatePanel('people')
    },
    /**
     * @param {string} resource
     * @return {Promise<*>}
     */
    openPublicLinkDialog: async function (resource) {
      await this.openSideBar(resource)
      return await appSideBar.activatePanel('links')
    },
    /**
     * @param {string} resource
     * @param {boolean} expected Asserts if we expect the preview image to be shown
     */
    checkPreviewImage: function (resource, expected) {
      const resourceRowSelector = this.getFileRowSelectorByFileName(resource)
      const previewSelector = resourceRowSelector + this.elements.previewImage.selector

      if (expected) {
        return this.useXpath().waitForElementVisible(previewSelector)
      }

      return this.useXpath().waitForElementNotPresent(previewSelector)
    },
    /**
     * @param {string} resource
     * @param {string} elementType
     * @return {Promise<module.exports.commands>}
     */
    deleteFile: async function (resource, elementType = 'any') {
      await this.openFileActionsMenu(resource, elementType)
      await fileActionsMenu.delete()
      return this
    },
    /**
     * @param {string} resource
     * @param {string} elementType
     * @returns {Promise<exports.commands>}
     */
    acceptShare: async function (resource, elementType = 'any') {
      await this.openFileActionsMenu(resource, elementType)
      await fileActionsMenu.acceptShare()
      return this
    },
    /**
     * @param {string} resource
     * @param {string} elementType
     * @returns {Promise<exports.commands>}
     */
    declineShare: async function (resource, elementType = 'any') {
      await this.openFileActionsMenu(resource, elementType)
      await fileActionsMenu.declineShare()
      return this
    },
    /**
     * @param {string} fromName
     * @param {string} toName
     * @param {boolean} expectToSucceed
     * @param {string} elementType
     * @return {Promise<module.exports.commands>}
     */
    renameFile: async function (fromName, toName, expectToSucceed = true, elementType = 'any') {
      await this.openFileActionsMenu(fromName, elementType)
      await fileActionsMenu.rename(toName, expectToSucceed)
      return this
    },
    renameFileFromContextMenu: async function (
      fromName,
      toName,
      expectToSucceed = true,
      elementType = 'any'
    ) {
      await this.openContextMenu(fromName, elementType)
      await contextMenu.selectRenameFile()
      return await fileActionsMenu.rename(toName, expectToSucceed, true)
    },
    /**
     * @param {string} resource
     * @param {string} elementType
     * @return {Promise<module.exports.commands>}
     */
    markFavorite: async function (resource, elementType = 'any') {
      await this.openFileActionsMenu(resource, elementType)
      await fileActionsMenu.favorite()
      return this
    },
    /**
     * @param {string} resource
     * @param {string} elementType
     * @return {Promise<module.exports.commands>}
     */
    unmarkFavorite: async function (resource, elementType = 'any') {
      await this.openFileActionsMenu(resource, elementType)
      await fileActionsMenu.unmarkFavorite()
      return this
    },
    /**
     * @param {string} resource
     * @param {string} elementType
     * @return {Promise<module.exports.commands>}
     */
    restoreFile: async function (resource, elementType = 'any') {
      // if there is popup message then wait for it to disappear
      await this.isVisible(
        {
          selector: this.page.webPage().elements.message.__selector,
          locateStrategy: this.page.webPage().elements.message.locateStrategy,
          timeout: this.api.globals.waitForNegativeConditionTimeout,
          suppressNotFoundErrors: true
        },
        (result) => {
          if (result.value === true) {
            this.waitForElementNotPresent({
              selector: this.page.webPage().elements.message.__selector,
              locateStrategy: this.page.webPage().elements.message.locateStrategy
            })
          }
        }
      )
      await this.openFileActionsMenu(resource, elementType)
      await fileActionsMenu.restore()
      return this
    },
    /**
     * @param {string} resource
     * @param {string} elementType
     * @return {Promise<module.exports.commands>}
     */
    deleteImmediately: async function (resource, elementType = 'any') {
      await this.openFileActionsMenu(resource, elementType)
      await fileActionsMenu.deleteResourceImmediately()
      return this
    },
    /**
     * @param {string} action
     * @param {string} resource
     * @param {string} elementType
     * @return {Promise<boolean>}
     */
    isActionAttributeDisabled: async function (action, resource, elementType = 'any') {
      await this.openFileActionsMenu(resource, elementType)
      return await fileActionsMenu.getActionDisabledAttr('delete')
    },
    /**
     * @param {string} resource
     * @param {string} elementType
     * @return {Promise<module.exports.commands>}
     */
    downloadFile: async function (resource, elementType = 'any') {
      await this.openFileActionsMenu(resource, elementType)
      await fileActionsMenu.download()
      return this
    },
    /**
     * @param {string} resource
     * @param {string} elementType
     * @return {Promise<module.exports.commands>}
     */
    isSharingButtonPresent: async function (resource, elementType = 'any') {
      const sharingBtnSelector = util.format(
        filesRow.elements.quickAction.selector,
        'collaborators'
      )
      const resourceRowSelector = this.getFileRowSelectorByFileName(resource, elementType)
      let isPresent = true

      await this.api.elements(
        this.elements.shareButtonInFileRow.locateStrategy,
        resourceRowSelector + sharingBtnSelector,
        (result) => {
          isPresent = result.value.length > 0
        }
      )

      return isPresent
    },
    /**
     * @return {Promise<*>}
     */
    confirmDeletion: function () {
      return this.click('@dialogConfirmBtnEnabled').waitForElementNotPresent('@dialog')
    },
    /**
     *
     * @param {string} folder
     */
    navigateToFolder: async function (folder) {
      await this.waitForFileVisible(folder)

      await this.useXpath().click(this.getFileLinkSelectorByFileName(folder, 'folder')).useCss()

      // wait until loading is finished
      await this.waitForLoadingFinished()

      return this
    },

    /**
     * opens context menu for given resource
     *
     * @param {string} resource The name or path of a resource
     * @param {string} elementType The resource type (file|folder|any)
     * @returns {*}
     */
    openContextMenu: async function (resource, elementType = 'any') {
      await this.waitForFileVisible(resource, elementType)
      const selectorContextMenu =
        this.getFileRowSelectorByFileName(resource, elementType) +
        this.elements.contextBtnInFileRow.selector
      await this.click('xpath', selectorContextMenu)
      await this.waitForElementVisible('@contextMenuPanel')
      return contextMenu
    },

    /**
     * opens file-actions menu for given resource
     *
     * @param {string} resource The resource name
     * @param {string} elementType The resource type (file|folder|any)
     *
     * @returns {*}
     */
    openFileActionsMenu: async function (resource, elementType = 'any') {
      await this.openSideBar(resource, elementType)
      await appSideBar.activatePanel('actions')
      return fileActionsMenu
    },

    /**
     * opens sidebar for given resource
     *
     * @param {string} resource
     * @param {string} elementType The resource type (file|folder|any)
     * @returns {*}
     */
    openSideBar: async function (resource, elementType = 'any') {
      // nothing to do if already open for correct resource
      if (await appSideBar.isSideBarOpenForResource(resource, elementType, false)) {
        return appSideBar
      }

      // closing it since otherwise tests fail on mobile
      // on desktop sidebar content gets replaced with new resource
      await appSideBar.closeSidebarIfOpen()

      // open the sidebar for the resource
      await this.clickRow(resource, elementType)
      await this.click('@btnToggleSideBar')
      await this.waitForAnimationToFinish() // wait for the sidebar animation to finish
      return appSideBar
    },
    /**
     * @param {string} resource the file/folder to click
     * @param {string} elementType The resource type (file|folder|any)
     */
    clickRow: async function (resource, elementType = 'any') {
      await this.waitForFileVisible(resource, elementType)
      await this.initAjaxCounters()
        .useXpath()
        // click in empty space in the tr using coordinates to avoid
        // clicking on other elements that might be in the front
        .clickElementAt(this.getFileRowSelectorByFileName(resource, elementType), 1, 1)
        .waitForOutstandingAjaxCalls()
        .useCss()

      return this
    },
    /**
     *
     */
    checkAllFiles: function () {
      return this.waitForElementVisible('@filesTable')
        .waitForElementVisible('@checkBoxAllFiles')
        .click('@checkBoxAllFiles')
    },

    /**
     * Toggle enable or disable file/folder select checkbox
     *
     * @param {string} enableOrDisable
     * @param {string} path
     */
    toggleFileOrFolderCheckbox: async function (enableOrDisable, path) {
      await this.waitForFileVisible(path)

      const fileCheckbox =
        this.getFileRowSelectorByFileName(path) + this.elements.checkboxInFileRow.selector
      await this.toggleCheckbox(enableOrDisable, fileCheckbox, 'xpath')

      return this
    },
    /**
     *
     * @param {string} path
     * @return {Promise<boolean>}
     */
    isResourceSelected: async function (path) {
      await this.waitForFileVisible(path)
      const fileCheckbox =
        this.getFileRowSelectorByFileName(path) + this.elements.checkboxInFileRow.selector
      let selectionStatus = ''
      await this.api.element('xpath', fileCheckbox, (result) => {
        if (!result.value.ELEMENT) {
          throw new Error('Web element identifier not found for ' + fileCheckbox)
        }
        this.api.elementIdSelected(
          result.value.ELEMENT,
          (result) => (selectionStatus = result.value)
        )
      })
      return selectionStatus
    },
    waitForLoadingFinished: async function (awaitVisible = true, abortOnFailure = true) {
      if (awaitVisible) {
        await this.waitForElementVisible({ selector: '@anyAfterLoading', abortOnFailure })
        return this
      }
      await this.waitForElementPresent({ selector: '@anyAfterLoading', abortOnFailure })
      return this
    },
    /**
     * Wait for a filerow with given filename to be visible
     *
     * @param {string} fileName
     * @param {string} elementType (file|folder)
     */
    waitForFileVisible: async function (fileName, elementType = 'any') {
      await this.checkFileName(fileName, elementType)
      const rowSelector = this.getFileRowSelectorByFileName(fileName, elementType)
      await appSideBar.closeSidebarIfOpen()

      let rowElementId = null
      await this.waitForElementPresent(
        { selector: rowSelector, locateStrategy: 'xpath' },
        (result) => {
          rowElementId = result.WebdriverElementId
        }
      )
      let offset = 0
      await this.api.elementIdLocation(rowElementId, (result) => {
        offset = result.value.y
      })
      let firstRowElementId = null
      await this.waitForElementPresent('@fileRow', (result) => {
        firstRowElementId = result.WebdriverElementId
      })
      await this.api.elementIdLocation(firstRowElementId, (result) => {
        offset -= result.value.y
      })
      this.api.execute('scrollTo(0,' + offset + ')')
    },
    checkFileName: async function (fileName, elementType = 'any') {
      const fileSelector = this.getFileSelectorByFileName(fileName, elementType)
      // res.value return file/folder name and file extension in different row
      // res.status return -1 if res return error otherwise return
      let resourceName = null
      let status = null
      let error = null
      await this.getText('xpath', fileSelector, (res) => {
        status = res.status
        const result = res.value
        if (status === 0) {
          resourceName = result.split('\n').join('')
        } else if (status === -1) {
          error = res.value.error
        }
      })
      if (error !== null) {
        assert.fail(error)
      }
      assert.ok(
        fileName.endsWith(resourceName),
        `Expected file name to be "${fileName}" but found "${resourceName}"`
      )
    },
    /**
     *
     * @param {string} fileName
     * @param {string} elementType Resource type (file/folder). Use `any` if not relevant.
     *
     * @returns {string}
     */
    getFileRowSelectorByFileName: function (fileName, elementType = 'any') {
      const name = xpathHelper.buildXpathLiteral(fileName)
      const path = xpathHelper.buildXpathLiteral('/' + fileName)
      if (elementType === 'any') {
        return util.format(this.elements.fileRowByResourcePathAnyType.selector, name, path)
      }
      const type = xpathHelper.buildXpathLiteral(elementType)
      return util.format(this.elements.fileRowByResourcePath.selector, name, path, type)
    },
    /**
     *
     * @param {string} fileName
     * @param {string} elementType
     * @returns {string}
     */
    getFileLinkSelectorByFileName: function (fileName, elementType = 'any') {
      const name = xpathHelper.buildXpathLiteral(fileName)
      const path = xpathHelper.buildXpathLiteral('/' + fileName)
      if (elementType === 'any') {
        return util.format(this.elements.fileLinkInFileRowAnyType.selector, name, path)
      }
      const type = xpathHelper.buildXpathLiteral(elementType)
      return util.format(this.elements.fileLinkInFileRow.selector, name, path, type)
    },
    /**
     *
     * @param {string} Name of the file/folder/resource
     * @param {string} elementType
     * @returns {string}
     */
    getFileSelectorByFileName: function (fileName, elementType = 'any') {
      const name = xpathHelper.buildXpathLiteral(fileName)
      const path = xpathHelper.buildXpathLiteral('/' + fileName)
      if (elementType === 'any') {
        return util.format(this.elements.fileNameResourcePathAnyType.selector, name, path)
      }
      const type = xpathHelper.buildXpathLiteral(elementType)
      return util.format(this.elements.fileNameResourcePath.selector, name, path, type)
    },
    /**
     * checks whether the element is listed or not on the filesList
     *
     * @param {string} name Name of the file/folder/resource
     * @param {string} elementType
     * @returns {boolean}
     */
    isElementListed: async function (name, elementType = 'any') {
      const selector = this.getFileRowSelectorByFileName(name, elementType)
      let isVisible = false

      await this.api.element('xpath', selector, function (result) {
        isVisible = !!(result.value && result.value.ELEMENT)
      })

      return isVisible
    },
    /**
     * @returns {Array} array of files/folders element
     */
    allFileRows: async function () {
      let returnResult = null
      await this.waitForElementPresent('@anyAfterLoading')
      await this.api.elements('css selector', this.elements.fileRow, function (result) {
        returnResult = result
      })
      return returnResult
    },
    waitForNoContentMessageVisible: async function () {
      let visible = false
      let elementId = null
      await this.waitForElementVisible('@filesListNoContentMessage')
      await this.api.element('@filesListNoContentMessage', (result) => {
        if (result.status !== -1) {
          elementId = result.value.ELEMENT
        }
      })
      if (elementId !== null) {
        await this.api.elementIdText(elementId, (result) => {
          // verify that at least some text is displayed, not an empty container
          if (result.status !== -1 && result.value.trim() !== '') {
            visible = true
          }
        })
      }
      assert.ok(visible, 'Message about empty file list must be visible')
    },
    waitForNotFoundMessageVisible: async function () {
      await this.waitForElementVisible('@filesListNotFoundMessage')
    },
    countFilesAndFolders: async function () {
      let itemCount = 0
      await this.waitForElementVisible('@filesListFooterInfo').getAttribute(
        '@filesListFooterInfo',
        'data-test-items',
        (result) => {
          itemCount = parseInt(result.value)
        }
      )
      return itemCount
    },

    /**
     *
     * @param {string} fileName
     * @param {boolean} sharingIndicatorExpectedToBeVisible
     * @returns {Array} array of sharing indicator
     */
    getShareIndicatorsForResource: async function (fileName, sharingIndicatorExpectedToBeVisible) {
      const resourceRowXpath = this.getFileRowSelectorByFileName(fileName)
      const shareIndicatorsXpath =
        resourceRowXpath + this.elements.shareIndicatorsInFileRow.selector
      const indicators = []
      await this.waitForFileVisible(fileName)
      await this.waitForAnimationToFinish()

      const {
        waitForNegativeConditionTimeout,
        waitForConditionTimeout,
        waitForConditionPollInterval
      } = client.globals
      await this.waitForElementVisible({
        selector: shareIndicatorsXpath,
        locateStrategy: this.elements.shareIndicatorsInFileRow.locateStrategy,
        abortOnFailure: false,
        timeout: sharingIndicatorExpectedToBeVisible
          ? waitForConditionTimeout
          : waitForNegativeConditionTimeout,
        pollInterval: waitForConditionPollInterval
      })
      await this.api.elements(
        this.elements.shareIndicatorsInFileRow.locateStrategy,
        shareIndicatorsXpath,
        (result) => {
          result.value.forEach((element) => {
            this.api.elementIdAttribute(element.ELEMENT, 'class', (attr) => {
              if (parseInt(attr.status) < 0) {
                return
              }
              this.api.elementIdAttribute(element.ELEMENT, 'data-test-indicator-type', (attr) => {
                indicators.push(attr.value)
              })
            })
          })
        }
      )
      return indicators
    },

    /**
     *
     * @param {string} fileName
     * @param {boolean} sharingIndicatorExpectedToBeVisible
     * @returns {Array} array of sharing indicator
     */
    getShareIndicatorsForResourceWithRetry: async function (
      fileName,
      sharingIndicatorExpectedToBeVisible
    ) {
      let indicators = await this.getShareIndicatorsForResource(
        fileName,
        sharingIndicatorExpectedToBeVisible
      )
      if (!indicators.length) {
        console.log('Share indicators not found on first try, Retrying again')
        indicators = await this.getShareIndicatorsForResource(
          fileName,
          sharingIndicatorExpectedToBeVisible
        )
      }
      return indicators
    },

    setSort: async function (column, isDesc = false) {
      const columnSelector = util.format(
        this.elements.filesTableHeaderColumn.selector,
        xpathHelper.buildXpathLiteral(column)
      )
      await this.useXpath()
        .waitForElementVisible(columnSelector)
        .click(columnSelector)
        .waitForElementVisible(columnSelector)
        .useCss()

      let currentClass = null
      await this.useXpath().getAttribute(columnSelector, 'class', (result) => {
        currentClass = result.value
      })
      if (currentClass.includes('-asc') && isDesc) {
        // click again to match expected sort order
        await this.useXpath().waitForElementVisible(columnSelector).click(columnSelector).useCss()
      }

      return this.useCss()
    },

    useQuickAction: async function (resource, action) {
      action = action.replace(/\s/, '-')
      const actionSelector = util.format(filesRow.elements.quickAction.selector, action)
      const resourceRowSelector = this.getFileRowSelectorByFileName(resource)

      await this.waitForFileVisible(resource)

      await this.click('xpath', resourceRowSelector + actionSelector)
      await this.waitForAnimationToFinish() // wait for the sidebar animation to finish
      return this
    },

    moveResource: async function (resource, target) {
      // Trigger move
      await this.openFileActionsMenu(resource)
      await fileActionsMenu.move()

      // Execute move
      await client.page.locationPicker().selectFolderAndConfirm(target)

      return this
    },

    cancelResourceMoveOrCopyProgress: async function () {
      // cancel copy or move
      await this.waitForElementVisible(this.elements.cancelMoveCopyBtn.selector).click(
        this.elements.cancelMoveCopyBtn.selector
      )
      await this.waitForLoadingFinished()

      return this
    },

    copyResource: async function (resource, target) {
      // Trigger copy
      await this.openFileActionsMenu(resource)
      await fileActionsMenu.copy()

      // Execute copy
      await client.page.locationPicker().selectFolderAndConfirm(target)

      return this
    },

    clickOnFileName: function (fileName) {
      const file = this.getFileLinkSelectorByFileName(fileName, 'file')
      return this.useXpath().waitForElementVisible(file).click(file).useCss()
    },
    closeRenameDialog: function () {
      return this.waitForElementVisible('@dialogCancelBtn').click('@dialogCancelBtn')
    }
  },
  elements: {
    filesContainer: {
      selector: '.files-list-wrapper'
    },
    filesAppBar: {
      selector: '#files-app-bar'
    },
    filesTable: {
      selector: '.files-table'
    },
    loadingIndicator: {
      selector: '//*[contains(@class, "oc-loader")]',
      locateStrategy: 'xpath'
    },
    filesListNoContentMessage: {
      selector: '.files-empty'
    },
    filesListNotFoundMessage: {
      selector: '.files-not-found'
    },
    filesListProgressBar: {
      selector: '#files-list-progress'
    },
    anyAfterLoading: {
      selector:
        '//*[self::table[contains(@class, "files-table")] or self::div[contains(@class, "files-empty")] or self::div[contains(@class, "files-not-found")]]',
      locateStrategy: 'xpath'
    },
    shareButtonInFileRow: {
      selector: '//button[@aria-label="People"]',
      locateStrategy: 'xpath'
    },
    fileRow: {
      selector: '.files-table .oc-tbody-tr'
    },
    fileNameResourcePathAnyType: {
      selector: `//span[contains(@class, "oc-resource-name") and (@data-test-resource-name=%s or @data-test-resource-path=%s)]`,
      locateStrategy: 'xpath'
    },
    fileNameResourcePath: {
      selector:
        '//span[contains(@class, "oc-resource-name") and (@data-test-resource-name=%s or @data-test-resource-path=%s) and @data-test-resource-type=%s]',
      locateStrategy: 'xpath'
    },
    fileRowByResourcePathAnyType: {
      selector: `//span[contains(@class, "oc-resource-name") and (@data-test-resource-name=%s or @data-test-resource-path=%s)]/ancestor::tr[contains(@class, "oc-tbody-tr")]`,
      locateStrategy: 'xpath'
    },
    fileRowByResourcePath: {
      selector: `//span[contains(@class, "oc-resource-name") and (@data-test-resource-name=%s or @data-test-resource-path=%s) and @data-test-resource-type=%s]/ancestor::tr[contains(@class, "oc-tbody-tr")]`,
      locateStrategy: 'xpath'
    },
    fileRowDisabled: {
      selector:
        '//span[contains(@class, "oc-resource-name") and (@data-test-resource-name=%s or @data-test-resource-path=%s) and @data-test-resource-type=%s]/ancestor::tr[contains(@class, "oc-table-disabled")]',
      locateStrategy: 'xpath'
    },
    fileLinkInFileRowAnyType: {
      selector:
        '//span[contains(@class, "oc-resource-name") and (@data-test-resource-name=%s or @data-test-resource-path=%s)]/parent::*',
      locateStrategy: 'xpath'
    },
    fileLinkInFileRow: {
      selector:
        '//span[contains(@class, "oc-resource-name") and (@data-test-resource-name=%s or @data-test-resource-path=%s) and @data-test-resource-type=%s]/parent::*',
      locateStrategy: 'xpath'
    },
    contextBtnInFileRow: {
      selector: '//button[contains(@class, "resource-table-btn-action-dropdown")]',
      locateStrategy: 'xpath'
    },
    contextMenuPanel: {
      selector: '#oc-files-context-menu'
    },
    /**
     * This element is concatenated as child of @see fileRowByResourcePath
     */
    filePreviewInFileRow: {
      selector: '//img[contains(@class, "oc-resource-thumbnail")]',
      locateStrategy: 'xpath'
    },
    /**
     * This element is concatenated as child of @see fileRowByResourcePath
     */
    shareIndicatorsInFileRow: {
      selector: '//*[contains(@class, "oc-status-indicators-indicator")]',
      locateStrategy: 'xpath'
    },
    checkBoxAllFiles: {
      selector: '#resource-table-select-all'
    },
    checkboxInFileRow: {
      selector: '//input[@type="checkbox"]',
      locateStrategy: 'xpath'
    },
    collaboratorsList: {
      selector: '.files-collaborators-lists'
    },
    filesListFooterInfo: {
      selector: '//p[@data-testid="files-list-footer-info"]',
      locateStrategy: 'xpath'
    },
    filesTableHeader: {
      selector: '.files-table .oc-thead'
    },
    filesTableHeaderColumn: {
      selector: '//*[contains(@class, "oc-table-header-cell")]//*[text()=%s]',
      locateStrategy: 'xpath'
    },
    // TODO: Merge with selectors in personalPage
    dialog: {
      selector: '.oc-modal'
    },
    dialogConfirmBtnEnabled: {
      selector: '.oc-modal-body-actions-confirm:enabled'
    },
    dialogCancelBtn: {
      selector: '.oc-modal-body-actions-cancel'
    },
    previewImage: {
      selector: '//img[contains(@class, "oc-resource-thumbnail")]',
      locateStrategy: 'xpath'
    },
    cancelMoveCopyBtn: {
      selector: '#location-picker-btn-cancel'
    },
    btnToggleSideBar: {
      selector: '#files-toggle-sidebar'
    },
    sharedWithToggleButton: {
      selector: '//*[contains(@class, "sharee-avatars")]/ancestor::button',
      locateStrategy: 'xpath'
    }
  }
}
