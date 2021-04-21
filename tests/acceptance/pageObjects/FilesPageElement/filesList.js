const util = require('util')
const assert = require('assert')
const xpathHelper = require('../../helpers/xpath')
const { client } = require('nightwatch-api')
const filesRow = client.page.FilesPageElement.filesRow()

module.exports = {
  commands: {
    /**
     * @param {string} resource
     * @return {Promise<*>}
     */
    openSharingDialog: async function(resource) {
      const appSidebar = client.page.FilesPageElement.appSideBar()
      await appSidebar.closeSidebar(500)
      await this.openSideBar(resource)
      return client.page.FilesPageElement.appSideBar().selectAccordionItem('people')
    },
    /**
     * @param {string} resource
     * @param {boolean} expected Asserts if we expect the preview image to be shown
     */
    checkPreviewImage: function(resource, expected) {
      const resourceRowSelector = this.getFileRowSelectorByFileName(resource)
      const previewSelector = resourceRowSelector + this.elements.previewImage.selector

      if (expected) {
        return this.useXpath().waitForElementVisible(previewSelector)
      }

      return this.useXpath().waitForElementNotPresent(previewSelector)
    },
    /**
     * @param {string} fileName
     * @return {Promise<*>}
     */
    openPublicLinkDialog: async function(fileName) {
      await this.waitForFileVisible(fileName)
      await this.openSideBar(fileName)
      return client.page.FilesPageElement.appSideBar().selectAccordionItem('links')
    },
    /**
     * @param {string} resource
     * @return {Promise<module.exports.commands>}
     */
    deleteFile: async function(resource) {
      await this.waitForFileVisible(resource)
      await filesRow.openFileActionsMenu(resource).delete()
      return this
    },
    /**
     * @param {string} fromName
     * @param {string} toName
     * @param {boolean} expectToSucceed
     * @return {Promise<module.exports.commands>}
     */
    renameFile: async function(fromName, toName, expectToSucceed = true) {
      await this.waitForFileVisible(fromName)
      await filesRow.openFileActionsMenu(fromName).rename(toName, expectToSucceed)
      return this
    },
    /**
     * @param {string} path
     * @return {Promise<module.exports.commands>}
     */
    markFavorite: async function(path) {
      await this.waitForFileVisible(path)
      await filesRow.openFileActionsMenu(path).favorite()
      return this
    },
    /**
     * @param {string} path
     * @return {Promise<module.exports.commands>}
     */
    unmarkFavorite: async function(path) {
      await this.waitForFileVisible(path)
      await filesRow.openFileActionsMenu(path).unmarkFavorite()
      return this
    },
    /**
     * @param {string} element
     * @param {string} elementType
     * @return {Promise<module.exports.commands>}
     */
    restoreFile: async function(element, elementType) {
      await this.waitForFileWithPathVisible(element, elementType)
      await filesRow.openFileActionsMenu(element, elementType).restore()
      return this
    },
    /**
     * @param {string} resource
     * @return {Promise<module.exports.commands>}
     */
    deleteImmediately: async function(resource) {
      await this.waitForFileVisible(resource)
      await filesRow.openFileActionsMenu(resource).deleteResourceImmediately(resource)
      return this
    },
    /**
     * @param {string} action
     * @param {string} resource
     * @return {Promise<boolean>}
     */
    isActionAttributeDisabled: async function(action, resource) {
      await this.waitForFileVisible(resource)
      return filesRow.openFileActionsMenu(resource).getActionDisabledAttr('delete')
    },
    /**
     * @param {string} resource
     * @return {Promise<module.exports.commands>}
     */
    downloadFile: async function(resource) {
      await this.waitForFileVisible(resource)
      await filesRow.openFileActionsMenu(resource).download()
      return this
    },
    /**
     * @param {string} resource
     * @return {Promise<module.exports.commands>}
     */
    isSharingButtonPresent: async function(resource) {
      const sharingBtnSelector = util.format(
        filesRow.elements.quickAction.selector,
        'collaborators'
      )
      const resourceRowSelector = this.getFileRowSelectorByFileName(resource)
      let isPresent = true

      await this.api.elements(
        this.elements.shareButtonInFileRow.locateStrategy,
        resourceRowSelector + sharingBtnSelector,
        result => {
          isPresent = result.value.length > 0
        }
      )

      return isPresent
    },
    /**
     * @return {Promise<*>}
     */
    confirmDeletion: function() {
      return this.waitForElementEnabled('@dialogConfirmBtn')
        .click('@dialogConfirmBtn')
        .waitForElementNotPresent('@dialog')
    },
    /**
     *
     * @param {string} folder
     */
    navigateToFolder: async function(folder) {
      await this.waitForFileVisible(folder)

      await this.useXpath()
        .click(this.getFileLinkSelectorByFileName(folder, 'folder'))
        .useCss()

      // wait until loading is finished
      await this.waitForLoadingFinished()

      return this
    },

    /**
     * opens sidebar for given resource
     *
     * @param {string} resource
     * @returns {*}
     */
    openSideBar: async function(resource) {
      await this.clickRow(resource)
      return this.api.page.FilesPageElement.appSideBar()
    },
    /**
     *
     */
    checkAllFiles: function() {
      return this.waitForElementVisible('@filesTable')
        .waitForElementVisible('@checkBoxAllFiles')
        .click('@checkBoxAllFiles')
    },
    /**
     * Restores all the selected files/folders
     *
     */
    restoreSelected: function() {
      return this.waitForElementVisible('@restoreSelectedButton')
        .initAjaxCounters()
        .useXpath()
        .click('@restoreSelectedButton')
        .waitForOutstandingAjaxCalls()
        .useCss()
    },
    /**
     * @param {string} item the file/folder to click
     */
    clickRow: async function(item) {
      await this.waitForFileVisible(item)
      await this.initAjaxCounters()
        .useXpath()
        // click in empty space in the tr using coordinates to avoid
        // clicking on other elements that might be in the front
        .clickElementAt(this.getFileRowSelectorByFileName(item), 1, 1)
        .waitForOutstandingAjaxCalls()
        .useCss()

      return this
    },

    /**
     * Toggle enable or disable file/folder select checkbox
     *
     * @param {string} enableOrDisable
     * @param {string} path
     */
    toggleFileOrFolderCheckbox: async function(enableOrDisable, path) {
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
    isResourceSelected: async function(path) {
      await this.waitForFileVisible(path)
      const fileCheckbox =
        this.getFileRowSelectorByFileName(path) + this.elements.checkboxInFileRow.selector
      let selectionStatus = ''
      await this.api.element('xpath', fileCheckbox, result => {
        if (!result.value.ELEMENT) {
          throw new Error('Web element identifier not found for ' + fileCheckbox)
        }
        this.api.elementIdSelected(result.value.ELEMENT, result => (selectionStatus = result.value))
      })
      return selectionStatus
    },
    waitForTableLoaded: async function() {
      await this.waitForElementVisible('@filesTable')
      return this
    },
    waitForLoadingFinished: async function(awaitVisible = true, abortOnFailure = true) {
      if (awaitVisible) {
        await this.waitForElementVisible({ selector: '@anyAfterLoading', abortOnFailure })
        return this
      }
      await this.waitForElementPresent({ selector: '@anyAfterLoading', abortOnFailure })
      return this
    },
    getResourceThumbnail: async function(resourceName, elementType) {
      let iconUrl = null
      await this.waitForFileVisible(resourceName)
      // try reading the src tag
      const fileRowPreviewSelector =
        this.getFileRowSelectorByFileName(resourceName, elementType) +
        this.elements.filePreviewInFileRow.selector
      await this.api.getAttribute('xpath', fileRowPreviewSelector, 'src', result => {
        // somehow when element was not found the result.value is an empty array...
        if (result.status !== -1 && typeof result.value === 'string') {
          iconUrl = result.value
        }
      })
      if (!iconUrl) {
        const fileRowIconSelector =
          this.getFileRowSelectorByFileName(resourceName, elementType) +
          this.elements.fileIconInFileRow.selector
        // check that at least the file type icon svg is displayed
        await this.api.waitForElementVisible('xpath', fileRowIconSelector)
      }
      return iconUrl
    },
    /**
     * Wait for a filerow with given filename to be visible
     *
     * @param {string} fileName
     * @param {string} elementType (file|folder)
     */
    waitForFileVisible: async function(fileName, elementType = 'any') {
      const rowSelector = this.getFileRowSelectorByFileName(fileName, elementType)

      await client.page.FilesPageElement.appSideBar().closeSidebar(500)
      let rowElementId = null
      await this.waitForElementPresent(
        { selector: rowSelector, locateStrategy: 'xpath' },
        result => {
          rowElementId = result.WebdriverElementId
        }
      )
      let offset = 0
      await this.api.elementIdLocation(rowElementId, result => {
        offset = result.value.y
      })

      let firstRowElementId = null
      await this.waitForElementPresent('@fileRow', result => {
        firstRowElementId = result.WebdriverElementId
      })
      await this.api.elementIdLocation(firstRowElementId, result => {
        offset -= result.value.y
      })

      this.api.execute('scrollTo(0,' + offset + ')')

      return this
    },
    /**
     * Wait for a filerow with given path to be visible
     * This only works in the favorites page as it uses the whole path of a file rather than just the name
     * This does not works in cases where the path starts with a space (eg. "  ParentFolder/file.txt")
     *
     * @param {string} path
     * @param {string} elementType
     */
    waitForFileWithPathVisible: async function(path, elementType = 'any') {
      await client.page.FilesPageElement.appSideBar().closeSidebar(500)
      const linkSelector = this.getFileLinkSelectorByFileName(path, elementType)
      const rowSelector = this.getFileRowSelectorByFileName(path, elementType)
      return this.useXpath()
        .waitForElementVisible(rowSelector)
        .getAttribute(linkSelector, 'innerText', function(result) {
          assert.strictEqual(result.value.trim(), path, 'displayed file name not as expected')
        })
        .useCss()
    },
    /**
     *
     * @param {string} fileName
     * @param {string} elementType Resource type (file/folder). Use `any` if not relevant.
     *
     * @returns {string}
     */
    getFileRowSelectorByFileName: function(fileName, elementType = 'any') {
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
    getFileLinkSelectorByFileName: function(fileName, elementType = 'any') {
      const name = xpathHelper.buildXpathLiteral(fileName)
      const path = xpathHelper.buildXpathLiteral('/' + fileName)
      if (elementType === 'any') {
        return util.format(this.elements.fileLinkInFileRowAnyType.selector, name, path)
      }
      const type = xpathHelper.buildXpathLiteral(elementType)
      return util.format(this.elements.fileLinkInFileRow.selector, name, path, type)
    },
    /**
     * checks whether the element is listed or not on the filesList
     *
     * @param {string} name Name of the file/folder/resource
     * @param {string} elementType
     * @returns {boolean}
     */
    isElementListed: async function(name, elementType = 'any') {
      const selector = this.getFileRowSelectorByFileName(name, elementType)
      let isVisible = false

      await this.api.element('xpath', selector, function(result) {
        isVisible = !!(result.value && result.value.ELEMENT)
      })

      return isVisible
    },
    /**
     * @returns {Array} array of files/folders element
     */
    allFileRows: async function() {
      let returnResult = null
      await this.waitForElementPresent('@anyAfterLoading')
      await this.api.elements('css selector', this.elements.fileRow, function(result) {
        returnResult = result
      })
      return returnResult
    },
    waitForNoContentMessageVisible: async function() {
      let visible = false
      let elementId = null
      await this.waitForElementVisible('@filesListNoContentMessage')
      await this.api.element('@filesListNoContentMessage', result => {
        if (result.status !== -1) {
          elementId = result.value.ELEMENT
        }
      })
      if (elementId !== null) {
        await this.api.elementIdText(elementId, result => {
          // verify that at least some text is displayed, not an empty container
          if (result.status !== -1 && result.value.trim() !== '') {
            visible = true
          }
        })
      }
      assert.ok(visible, 'Message about empty file list must be visible')
    },
    waitForNotFoundMessageVisible: async function() {
      await this.waitForElementVisible('@filesListNotFoundMessage')
    },
    countFilesAndFolders: async function() {
      let filesCount = 0
      let foldersCount = 0

      await this.waitForElementVisible('@filesCount').getText('@filesCount', result => {
        filesCount = parseInt(result.value, 10)
      })

      await this.waitForElementVisible('@foldersCount').getText('@foldersCount', result => {
        foldersCount = parseInt(result.value, 10)
      })

      return filesCount + foldersCount
    },

    /**
     *
     * @param {string} fileName
     * @param {boolean} sharingIndicatorExpectedToBeVisible
     * @returns {Array} array of sharing indicator
     */
    getShareIndicatorsForResource: async function(fileName, sharingIndicatorExpectedToBeVisible) {
      const resourceRowXpath = this.getFileRowSelectorByFileName(fileName)
      const shareIndicatorsXpath =
        resourceRowXpath + this.elements.shareIndicatorsInFileRow.selector
      const indicators = []
      await this.waitForFileVisible(fileName)
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
        result => {
          result.value.forEach(element => {
            this.api.elementIdAttribute(element.ELEMENT, 'class', attr => {
              if (parseInt(attr.status) < 0) {
                return
              }
              if (attr.value.indexOf('uk-invisible') >= 0) {
                return
              }
              this.api.elementIdAttribute(element.ELEMENT, 'aria-label', attr => {
                switch (attr.value) {
                  case 'Directly shared with people':
                    indicators.push('user-direct')
                    break
                  case 'Shared with people through one of the parent folders':
                    indicators.push('user-indirect')
                    break
                  case 'Directly shared with links':
                    indicators.push('link-direct')
                    break
                  case 'Shared with links through one of the parent folders':
                    indicators.push('link-indirect')
                    break
                  default:
                    console.warn('Unknown share indicator found: "' + attr + '"')
                }
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
    getShareIndicatorsForResourceWithRetry: async function(
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

    setSort: async function(column, isDesc = false) {
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
      await this.useXpath().getAttribute(columnSelector, 'class', result => {
        currentClass = result.value
      })
      if (currentClass.includes('-asc') && isDesc) {
        // click again to match expected sort order
        await this.useXpath()
          .waitForElementVisible(columnSelector)
          .click(columnSelector)
          .useCss()
      }

      return this.useCss()
    },

    /**
     * Returns original string with replaced target character
     * @param   {string} string     String in which will be the target character replaced
     * @param   {string} targetChar Target character which is to be replaced
     * @param   {string} newChar    New character which will replace target character
     * @returns {string}            String with replaced target character
     */
    replaceChar: function(string, targetChar, newChar) {
      const regex = new RegExp(targetChar, 'g')
      return string.replace(regex, newChar)
    },

    useQuickAction: async function(resource, action) {
      action = action.replace(/\s/, '-')
      const actionSelector = util.format(
        this.api.page.FilesPageElement.filesRow().elements.quickAction.selector,
        action
      )
      const resourceRowSelector = this.getFileRowSelectorByFileName(resource)

      await this.waitForFileVisible(resource)

      return this.useXpath()
        .click(resourceRowSelector + actionSelector)
        .useCss()
    },

    moveResource: async function(resource, target) {
      await this.waitForFileVisible(resource)

      // Trigger move
      await filesRow.openFileActionsMenu(resource).move()

      // Execute move
      await client.page.locationPicker().selectFolderAndConfirm(target)

      return this
    },

    attemptToMoveResource: async function(resource, target) {
      await this.waitForFileVisible(resource)

      // Trigger move
      await filesRow.openFileActionsMenu(resource).move()

      // select folder
      await client.page.locationPicker().selectFolder(target)

      return this
    },

    cancelResourceMoveOrCopyProgress: async function() {
      // cancel copy or move
      await this.useXpath()
        .waitForElementVisible(client.page.personalPage().elements.cancelMoveCopyBtn.selector)
        .click(this.page.personalPage().elements.cancelMoveCopyBtn.selector)
        .useCss()
      await this.waitForLoadingFinished()

      return this
    },

    copyResource: async function(resource, target) {
      await this.waitForFileVisible(resource)

      // Trigger copy
      await filesRow.openFileActionsMenu(resource).copy()

      // Execute copy
      await client.page.locationPicker().selectFolderAndConfirm(target)

      return this
    },

    attemptToCopyResource: async function(resource, target) {
      await this.waitForFileVisible(resource)

      // Trigger copy
      await filesRow.openFileActionsMenu(resource).copy()

      // Execute copy
      await client.page.locationPicker().selectFolder(target)

      return this
    },
    clickOnFileName: function(fileName) {
      const file = this.getFileLinkSelectorByFileName(fileName, 'file')
      return this.useXpath()
        .waitForElementVisible(file)
        .click(file)
        .useCss()
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
    fileRowByResourcePathAnyType: {
      selector: `//span[contains(@class, "oc-resource-name") and (@resource-name=%s or @resource-path=%s)]/ancestor::tr[contains(@class, "oc-tbody-tr")]`,
      locateStrategy: 'xpath'
    },
    fileRowByResourcePath: {
      selector: `//span[contains(@class, "oc-resource-name") and (@resource-name=%s or @resource-path=%s) and @resource-type=%s]/ancestor::tr[contains(@class, "oc-tbody-tr")]`,
      locateStrategy: 'xpath'
    },
    fileRowDisabled: {
      selector:
        '//span[contains(@class, "oc-resource-name") and (@resource-name=%s or @resource-path=%s) and @resource-type=%s]/ancestor::tr[contains(@class, "oc-table-disabled")]',
      locateStrategy: 'xpath'
    },
    fileLinkInFileRowAnyType: {
      selector:
        '//span[contains(@class, "oc-resource-name") and (@resource-name=%s or @resource-path=%s)]/parent::*',
      locateStrategy: 'xpath'
    },
    fileLinkInFileRow: {
      selector:
        '//span[contains(@class, "oc-resource-name") and (@resource-name=%s or @resource-path=%s) and @resource-type=%s]/parent::*',
      locateStrategy: 'xpath'
    },
    /**
     * This element is concatenated as child of @see fileRowByResourcePath
     */
    fileIconInFileRow: {
      selector: '//span[contains(@class, "oc-icon-passive")]//*[local-name() = "svg"]',
      locateStrategy: 'xpath'
    },
    /**
     * This element is concatenated as child of @see fileRowByResourcePath
     */
    filePreviewInFileRow: {
      selector: '//img[contains(@class, "oc-resource-preview")]',
      locateStrategy: 'xpath'
    },
    /**
     * This element is concatenated as child of @see fileRowByResourcePath
     */
    shareIndicatorsInFileRow: {
      selector: '//*[contains(@class, "oc-status-indicators-indicator")]',
      locateStrategy: 'xpath'
    },
    publicLinkSideBar: {
      selector: '#oc-files-file-link'
    },
    checkBoxAllFiles: {
      selector: '#oc-table-files-select-all'
    },
    checkboxInFileRow: {
      selector: '//input[@type="checkbox"]',
      locateStrategy: 'xpath'
    },
    restoreSelectedButton: {
      selector: '//span[contains(text(),"Restore")]',
      locateStrategy: 'xpath'
    },
    linkToPublicLinksTag: {
      selector: '//div[@class="sidebar-container"]//a[normalize-space(.)="Links"]',
      locateStrategy: 'xpath'
    },
    collaboratorsList: {
      selector: '.files-collaborators-lists'
    },
    foldersCount: {
      selector: '#files-list-count-folders'
    },
    filesCount: {
      selector: '#files-list-count-files'
    },
    filesTableHeader: {
      selector: '.files-table .oc-thead'
    },
    filesTableHeaderColumn: {
      selector: '//*[contains(@class, "oc-sortable-column-header")]//*[text()=%s]/ancestor::button',
      locateStrategy: 'xpath'
    },
    // TODO: Merge with selectors in personalPage
    dialog: {
      selector: '.oc-modal'
    },
    dialogConfirmBtn: {
      selector: '.oc-modal-body-actions-confirm'
    },
    previewImage: {
      selector: '//img[contains(@class, "oc-resource-preview")]',
      locateStrategy: 'xpath'
    }
  }
}
