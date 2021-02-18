const util = require('util')
const path = require('path')
const assert = require('assert')
const xpathHelper = require('../../helpers/xpath')
const { join } = require('../../helpers/path')
const { client } = require('nightwatch-api')
const filesRow = client.page.FilesPageElement.filesRow()

module.exports = {
  commands: {
    /**
     * @param {string} fileName
     * @return {Promise<*>}
     */
    openSharingDialog: async function(fileName) {
      const appSidebar = client.page.FilesPageElement.appSideBar()

      await appSidebar.closeSidebar(500)
      await this.waitForFileVisible(fileName)
      await this.openSideBar(fileName)
      return client.page.FilesPageElement.appSideBar().selectAccordionItem('people')
    },
    /**
     * @param {string} fileName
     * @return {Promise<*>}
     */
    isPreviewImageDisplayed: async function(fileName, shouldOrShouldnot) {
      await this.waitForFileVisible(fileName)
      const element = util.format(this.elements.previewImageParentDiv.selector, fileName)
      const imageSelector = util.format(this.elements.previewImage.selector, fileName)
      let previewStatus = ''
      await this.useXpath().waitForElementVisible(element)
      if (shouldOrShouldnot === 'should') {
        await this.useXpath().waitForElementVisible(imageSelector)
      }
      await this.getAttribute(
        { selector: element, locateStrategy: this.elements.previewImageParentDiv.locateStrategy },
        'data-preview-loaded',
        result => (previewStatus = result.value === 'true')
      )
      return previewStatus
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
      return this.initAjaxCounters()
        .waitForElementEnabled('@dialogConfirmBtn')
        .click('@dialogConfirmBtn')
        .waitForOutstandingAjaxCalls()
        .waitForElementNotPresent('@dialog')
    },
    /**
     *
     * @param {string} folder
     */
    navigateToFolder: async function(folder) {
      await this.waitForFileVisible(folder)
      await this.initAjaxCounters()

      await this.useXpath()
        .moveToElement(this.getFileRowSelectorByFileName(folder), 0, 0)
        .click(this.getFileLinkSelectorByFileName(folder))
        .useCss()
        .waitForElementNotPresent('@filesListProgressBar')

      // wait for previews to finish loading
      await this.waitForOutstandingAjaxCalls()
      await this.waitForAllThumbnailsLoaded()

      return this
    },

    /**
     *
     * @param {string} folder
     */
    navigateUptoFolder: async function(folder) {
      await this.waitForFileVisible(folder)
      await this.initAjaxCounters()

      await this.useXpath().moveToElement(this.getFileRowSelectorByFileName(folder), 0, 0)

      // wait for previews to finish loading
      await this.waitForOutstandingAjaxCalls()
      await this.waitForAllThumbnailsLoaded()

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
      return this.initAjaxCounters()
        .waitForElementVisible('@filesTable')
        .waitForElementVisible('@checkBoxAllFiles')
        .click('@checkBoxAllFiles')
    },
    /**
     * Restores all the selected files/folders
     *
     */
    restoreSelected: function() {
      return this.initAjaxCounters()
        .waitForElementVisible('@restoreSelectedButton')
        .useXpath()
        .click('@restoreSelectedButton')
        .waitForOutstandingAjaxCalls()
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
    /**
     * Wait for A filerow with given filename to be visible
     *
     * @param {string} fileName
     * @param {string} elementType
     * @param timeout
     */
    waitForFileVisible: async function(fileName, elementType = 'file', timeout = null) {
      const linkSelector = this.getFileLinkSelectorByFileName(fileName, elementType)

      await client.page.FilesPageElement.appSideBar().closeSidebar(500)
      await this.filesListScrollToTop()
      // Find the item in files list if it's not in the view
      await this.findItemInFilesList(fileName)

      // getAttribute does not have a timeout parameter, so we need to set the global timeout
      const oldWaitForConditionTimeout = client.globals.waitForConditionTimeout
      if (timeout !== null) {
        client.globals.waitForConditionTimeout = parseInt(timeout, 10)
      }
      await this.useXpath()
        .getAttribute(linkSelector, 'filename', function(result) {
          client.globals.waitForConditionTimeout = oldWaitForConditionTimeout
          if (result.value.error) {
            assert.fail(result.value.error)
          }
          // using basename because some file lists display the full path while the
          // file name attribute only contains the basename
          assert.strictEqual(
            result.value,
            path.basename(fileName),
            'displayed file name not as expected'
          )
        })
        .useCss()
      // Wait for preview to be loaded
      return this.waitForThumbnailLoaded(fileName, elementType)
    },
    /**
     * Wait for all visible thumbnails to finish loading
     */
    waitForAllThumbnailsLoaded: function() {
      return this.waitForElementNotPresent('@allFilePreviewsLoading')
    },
    waitForThumbnailLoaded: async function(resourceName, elementType) {
      if (elementType !== 'file') {
        // no thumbnails for folders
        return this
      }
      const fileRowPreviewLoadedSelector =
        this.getFileRowSelectorByFileName(resourceName, elementType) +
        this.elements.filePreviewLoadedInFileRow.selector
      await this.useXpath()
        .waitForElementVisible(fileRowPreviewLoadedSelector)
        .useCss()
      return this
    },
    getResourceThumbnail: async function(resourceName, elementType) {
      const fileRowPreviewSelector =
        this.getFileRowSelectorByFileName(resourceName, elementType) +
        this.elements.filePreviewInFileRow.selector
      const fileRowIconSelector =
        this.getFileRowSelectorByFileName(resourceName, elementType) +
        this.elements.fileIconInFileRow.selector
      let iconUrl = null
      // this implicitly waits for preview to be loaded
      await this.waitForFileVisible(resourceName)
      // try reading the src tag
      await this.useXpath()
        .getAttribute(
          {
            selector: fileRowPreviewSelector
          },
          'src',
          result => {
            // somehow when element was not found the result.value is an empty array...
            if (result.status !== -1 && typeof result.value === 'string') {
              iconUrl = result.value
            }
          }
        )
        .useCss()
      if (!iconUrl) {
        // check that at least the file type icon svg is displayed
        await this.useXpath()
          .waitForElementVisible(fileRowIconSelector)
          .useCss()
      }
      return iconUrl
    },
    /**
     * Wait for A filerow with given path to be visible
     * This only works in the favorites page as it uses the whole path of a file rather than just the name
     * This does not works in cases where the path starts with a space (eg. "  ParentFolder/file.txt")
     *
     * @param {string} path
     * @param {string} elementType
     */
    waitForFileWithPathVisible: function(path, elementType = 'file') {
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
     * @param {string} elementType
     *
     * @returns {string}
     */
    getFileRowSelectorByFileName: function(fileName, elementType = 'file') {
      if (elementType === 'file') {
        const parts = path.parse(fileName)
        // If our file has a extension that starts with space (for eg. "newfile. txt")
        // Then the whole name comes in the filename part (i.e. The file has no extension in such case)
        // Since the extension has spaces immediately after '.' we check for spaces after removing the '.' using slice().
        if (parts.ext && !parts.ext.slice(1).startsWith(' ')) {
          // keep path of nested folders intact, just remove the extension at the end
          const filePathWithoutExt = parts.dir ? join(parts.dir, parts.name) : parts.name
          const element = this.elements.fileRowByNameAndExtension
          return util.format(
            element.selector,
            xpathHelper.buildXpathLiteral(filePathWithoutExt),
            parts.ext
          )
        }
      }
      const element = this.elements.fileRowByName
      return util.format(element.selector, xpathHelper.buildXpathLiteral(fileName))
    },
    /**
     *
     * @param {string} fileName
     * @param {string} elementType
     * @returns {string}
     */
    getFileLinkSelectorByFileName: function(fileName, elementType) {
      return (
        this.getFileRowSelectorByFileName(fileName, elementType) +
        this.elements.fileLinkInFileRow.selector
      )
    },
    /**
     * checks whether the element is listed or not on the filesList
     *
     * @param {string} element Name of the file/folder/resource
     * @param {string} elementType
     * @param timeout
     * @returns {boolean}
     */
    isElementListed: async function(element, elementType = 'file', timeout = null) {
      let isListed = false
      await this.waitForFileVisible(element, elementType, timeout)
        .then(function() {
          isListed = true
        })
        .catch(function() {
          isListed = false
        })
      return isListed
    },
    /**
     * @returns {Array} array of files/folders element
     */
    allFileRows: async function() {
      let returnResult = null
      await this.waitForElementVisible('@filesTable')
      await this.api.elements('css selector', this.elements.fileRows, function(result) {
        returnResult = result
      })
      return returnResult
    },
    /**
     * Returns whether the empty folder message is visible
     *
     * @return {Boolean} true if the message is visible, false otherwise
     */
    isNoContentMessageVisible: async function() {
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
      return visible
    },
    isNotFoundMessageVisible: async function() {
      await this.waitForElementNotPresent('@filesListProgressBar')
      let isVisible = false
      await this.api.element('@filesListNotFoundMessage', result => {
        isVisible = Object.keys(result.value).length > 0
      })
      return isVisible
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
     * Find an item in the files list. Scrolls down in case the item is not visible in viewport
     */
    findItemInFilesList: async function(itemName) {
      // Escape double quotes inside of selector
      if (itemName.indexOf('"') > -1) {
        itemName = this.replaceChar(itemName, '"', '\\"')
      }

      await this.initAjaxCounters()
      await this.waitForElementVisible('@virtualScrollWrapper')
      await this.api.executeAsync(
        function({ itemName, scrollWrapperSelector, listHeaderSelector, listItemSelector }, done) {
          const virtualScrollWrapper = document.querySelector(scrollWrapperSelector)
          const tableHeaderPosition = document
            .querySelector(listHeaderSelector)
            .getBoundingClientRect().bottom
          let scrollDistance = virtualScrollWrapper.scrollTop

          function scrollUntilElementVisible() {
            const item = document.querySelector(`[filename="${itemName}"]`)

            if (item) {
              const position = item.getBoundingClientRect()
              // Add position from top to list container height to properly decide if the item is visible
              const visiblePosition = virtualScrollWrapper.clientHeight + tableHeaderPosition

              // Check if the item is inside the view after it's rendered
              if (position.top > -1 && position.top <= visiblePosition) {
                done()
                return
              }
            }

            if (virtualScrollWrapper.scrollHeight <= scrollDistance) {
              done()
              return
            }

            const listItemHeight = document.querySelector(listItemSelector).clientHeight

            scrollDistance += listItemHeight * 5
            virtualScrollWrapper.scrollTop = scrollDistance
            setTimeout(function() {
              scrollUntilElementVisible()
            }, 500)
          }

          scrollUntilElementVisible()
        },
        [
          {
            itemName: itemName,
            scrollWrapperSelector: this.elements.virtualScrollWrapper.selector,
            listHeaderSelector: this.elements.filesTableHeader.selector,
            listItemSelector: this.elements.filesListItem.selector
          }
        ]
      )

      // wait for previews to be loaded after scrolling to resources that were
      // not rendered before
      await this.waitForOutstandingAjaxCalls()

      return this
    },

    /**
     * Scroll the files list to the beginning
     */
    filesListScrollToTop: async function() {
      await this.waitForElementVisible('@virtualScrollWrapper')
      await this.api.executeAsync(
        function(scrollerContainerSelector, done) {
          const filesListScroll = document.querySelector(scrollerContainerSelector)
          if (filesListScroll.scrollTop > 0) {
            filesListScroll.scrollTop = 0
          }

          done()
        },
        [this.elements.virtualScrollWrapper.selector]
      )

      return this
    },

    getShareIndicatorsForResource: async function(fileName) {
      const resourceRowXpath = this.getFileRowSelectorByFileName(fileName)
      const shareIndicatorsXpath =
        resourceRowXpath + this.elements.shareIndicatorsInFileRow.selector
      const indicators = []

      await this.waitForFileVisible(fileName)

      await this.api.elements(
        this.elements.shareIndicatorsInFileRow.locateStrategy,
        shareIndicatorsXpath,
        result => {
          result.value.forEach(element => {
            this.api.elementIdAttribute(element.ELEMENT, 'class', attr => {
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

    getCollaboratorsForResource: async function(fileName) {
      const resourceRowXpath = this.getFileRowSelectorByFileName(fileName)
      const collaboratorsXpath = resourceRowXpath + this.elements.collaboratorsInFileRow.selector
      const collaborators = []

      await this.waitForFileVisible(fileName)

      await this.api.elements(
        this.elements.collaboratorsInFileRow.locateStrategy,
        collaboratorsXpath,
        result => {
          result.value.forEach(element => {
            return this.api.elementIdText(element.ELEMENT, attr => {
              collaborators.push(attr.value)
            })
          })
        }
      )
      return collaborators
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

    cancelResourceMoveOrCopyProgress: async function(target) {
      await this.waitForFileVisible(target)

      // cancel copy or move
      await this.useXpath()
        .waitForElementVisible(client.page.filesPage().elements.cancelMoveCopyBtn.selector)
        .click(this.page.filesPage().elements.cancelMoveCopyBtn.selector)
        .useCss()

      return this
    },

    navigationNotAllowed: async function(target) {
      await this.waitForFileVisible(target)
      await this.initAjaxCounters()

      const element = util.format(this.elements.fileRowDisabled.selector, target)
      const disabledRow = {
        locateStrategy: this.elements.fileRowDisabled.locateStrategy,
        selector: element
      }
      await this.useXpath()
        .moveToElement(this.getFileRowSelectorByFileName(target), 0, 0)
        .waitForElementVisible(disabledRow)

      await this.waitForOutstandingAjaxCalls()
      await this.waitForAllThumbnailsLoaded()

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
    clickOnFileName: async function(fileName) {
      await this.findItemInFilesList(fileName)
      const file = await this.getFileLinkSelectorByFileName(fileName)
      return this.useXpath()
        .waitForElementVisible(file)
        .click(file)
        .useCss()
    }
  },
  elements: {
    filesTable: {
      selector: '#files-personal-table'
    },
    fileRows: {
      selector: '#files-personal-table.oc-tbody-tr'
    },
    loadingIndicator: {
      selector: '//*[contains(@class, "oc-loader")]',
      locateStrategy: 'xpath'
    },
    filesListProgressBar: {
      selector: '#files-list-progress'
    },
    filesListNoContentMessage: {
      selector: '#files-personal-empty'
    },
    filesListNotFoundMessage: {
      selector: '#files-personal-not-found'
    },
    shareButtonInFileRow: {
      selector: '//button[@aria-label="People"]',
      locateStrategy: 'xpath'
    },
    fileRowByName: {
      selector:
        '//span[contains(@class, "oc-resource-name") and text()=%s and not(../span[contains(@class, "oc-resource-extension")])]/ancestor::div[@data-is-visible="true"]',
      locateStrategy: 'xpath'
    },
    fileRowByNameAndExtension: {
      selector:
        '//div[contains(@class, "oc-resource-name")][span/text()=%s and span/text()="%s"]/ancestor::div[@data-is-visible="true"]',
      locateStrategy: 'xpath'
    },
    fileLinkInFileRow: {
      selector: '//div[contains(@class, "oc-resource-name")]',
      locateStrategy: 'xpath'
    },
    fileIconInFileRow: {
      selector: '//div[contains(@class, "oc-resource")]//*[local-name() = "svg"]',
      locateStrategy: 'xpath'
    },
    filePreviewInFileRow: {
      selector: '//div[contains(@class, "oc-resource")]//img',
      locateStrategy: 'xpath'
    },
    allFilePreviewsLoading: {
      selector: '//div[contains(@class, "oc-resource") and @data-preview-loaded="false"]',
      locateStrategy: 'xpath'
    },
    filePreviewLoadedInFileRow: {
      selector:
        '//div[contains(@class, "oc-resource") and (@data-preview-loaded="true" or @data-preview-loaded="disabled")]',
      locateStrategy: 'xpath'
    },
    collaboratorsInFileRow: {
      selector: '//*[contains(@class, "file-row-collaborator-name")]',
      locateStrategy: 'xpath'
    },
    shareIndicatorsInFileRow: {
      selector: '//*[contains(@class, "file-row-share-indicator")]',
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
    virtualScrollWrapper: {
      selector: '.vue-recycle-scroller'
    },
    filesTableHeader: {
      selector: '#files-personal-table.oc-thead'
    },
    filesTableHeaderColumn: {
      selector: '//*[contains(@class, "oc-sortable-column-header")]//*[text()=%s]/ancestor::button',
      locateStrategy: 'xpath'
    },
    // TODO: Merge with selectors in filesPage
    dialog: {
      selector: '.oc-modal'
    },
    dialogConfirmBtn: {
      selector: '.oc-modal-body-actions-confirm'
    },
    fileRowDisabled: {
      selector:
        '//span[contains(@class, "oc-file-name") and text()="%s" and not(../span[contains(@class, "oc-resource-extension")])]/ancestor::div[@class="files-list-row-disabled" and @data-is-visible="true"]',
      locateStrategy: 'xpath'
    },
    filesListItem: {
      selector: '#files-personal-table.oc-tbody-tr'
    },
    previewImageParentDiv: {
      selector: '//div[@filename="%s"]/ancestor::div[contains(@class, "oc-resource")]',
      locateStrategy: 'xpath'
    },
    previewImage: {
      selector: '//div[@filename="%s"]/ancestor::div[contains(@class, "oc-resource")]/img',
      locateStrategy: 'xpath'
    }
  }
}
