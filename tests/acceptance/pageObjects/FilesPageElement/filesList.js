const util = require('util')
const path = require('path')
const xpathHelper = require('../../helpers/xpath')
const { join } = require('../../helpers/path')

module.exports = {
  commands: {
    /**
     * Get Selector for File Actions expander
     *
     * @param {string} fileName
     * @param {string} elementType
     * @returns {string} file action button selector
     */
    getFileActionBtnSelector: function (fileName, elementType = 'file') {
      return this.getFileRowSelectorByFileName(fileName, elementType) +
        this.api.page.FilesPageElement.fileActionsMenu().elements
          .fileActionsButtonInFileRow.selector
    },
    /**
     * @param {string} fileName
     * @return {Promise<*>}
     */
    openSharingDialog: async function (fileName) {
      await this.waitForFileVisible(fileName)
      return this.openFileActionsMenu(fileName)
        .openCollaboratorsDialog()
    },
    /**
     * opens links dialog for given resource
     * assumes fileActionsMenu to be opened, as the its moves to links tab from file-actions share option
     *
     * @return {*}
     */
    openLinksDialog: function () {
      const api = this.api.page.FilesPageElement
      const sidebarLinksTabXpath = api.appSideBar().elements.sidebarLinksTab.selector
      api.fileActionsMenu()
        .openCollaboratorsDialog()
        .useXpath()
        .waitForElementVisible(sidebarLinksTabXpath)
        .click(sidebarLinksTabXpath)
        .useCss()
      return api.publicLinksDialog()
    },
    /**
     * @param {string} fileName
     * @return {Promise<*>}
     */
    openPublicLinkDialog: async function (fileName) {
      await this.waitForFileVisible(fileName)
      await this.openFileActionsMenu(fileName)
      return this.openLinksDialog()
    },
    /**
     * @param {string} resource
     * @return {Promise<module.exports.commands>}
     */
    deleteFile: async function (resource) {
      await this.waitForFileVisible(resource)
      await this
        .openFileActionsMenu(resource)
        .delete()
      return this
    },
    /**
     * @param {string} fromName
     * @param {string} toName
     * @param {boolean} expectToSucceed
     * @return {Promise<module.exports.commands>}
     */
    renameFile: async function (fromName, toName, expectToSucceed = true) {
      await this.waitForFileVisible(fromName)
      await this
        .openFileActionsMenu(fromName)
        .rename(toName, expectToSucceed)
      return this
    },
    /**
     * @param {string} element
     * @param {string} elementType
     * @return {Promise<module.exports.commands>}
     */
    restoreFile: async function (element, elementType) {
      await this.waitForFileWithPathVisible(element, elementType)
      await this
        .openFileActionsMenu(element, elementType)
        .restore()
      return this
    },
    /**
     * @param {string} resource
     * @return {Promise<module.exports.commands>}
     */
    deleteImmediately: async function (resource) {
      await this.waitForFileVisible(resource)
      await this
        .openFileActionsMenu(resource)
        .deleteResourceImmediately(resource)
      return this
    },
    /**
     * @param {string} action
     * @param {string} resource
     * @return {Promise<boolean>}
     */
    isActionAttributeDisabled: async function (action, resource) {
      await this.waitForFileVisible(resource)
      return this
        .openFileActionsMenu(resource)
        .getActionDisabledAttr('delete')
    },
    /**
     * @param {string} resource
     * @return {Promise<module.exports.commands>}
     */
    downloadFile: async function (resource) {
      await this.waitForFileVisible(resource)
      await this
        .openFileActionsMenu(resource)
        .download()
      return this
    },
    /**
     * @param {string} resource
     * @return {Promise<module.exports.commands>}
     */
    isSharingButtonPresent: async function (resource) {
      await this.waitForFileVisible(resource)
      await this
        .openFileActionsMenu(resource)
        .isSharingBtnPresent()
      return this
    },
    /**
     * @return {Promise<*>}
     */
    confirmDeletion: async function () {
      const clickAction = function () {
        return this.initAjaxCounters()
          .waitForElementEnabled('@deleteFileConfirmationBtn')
          .click('@deleteFileConfirmationBtn')
          .waitForOutstandingAjaxCalls()
          .waitForElementNotVisible(
            this.elements.deleteFileConfirmationDialog.selector,
            this.api.globals.waitForConditionTimeout,
            this.api.globals.waitForConditionPollInterval,
            false,
            function () {
              console.log('waited for popup to disappear.')
            }
          )
      }.bind(this)
      await clickAction()

      let isPopupVisible = false

      /* issue: https://github.com/owncloud/phoenix/issues/1728
         Clicking "OK" button on deletion confirmation dialog does not
         disappear some of the times.

         Why not just wait and click again later?
         Some of the times, the "click" works and the popup starts
         disappearing, but hasn't yet. So, it requires us to wait for
         popup to disappear for quite a while and then, again recheck
         if it's visible again. And, if it is, then only re-click.

         We have `waitForCSSPropertyEquals` below that should check if clicking
         once or twice really worked.

         TODO: Investigate further why the "click" is not working
      */
      await this.isVisible(
        {
          selector: this.elements.deleteFileConfirmationDialog.selector,
          locateStrategy: this.elements.deleteFileConfirmationDialog.locateStrategy,
          suppressNotFoundErrors: true
        },
        ({ value }) => { isPopupVisible = value }
      )
      if (isPopupVisible === true) {
        console.log('Retrying again. Popup did not disappear.')
        await clickAction()
      }

      return this.waitForCSSPropertyEquals(
        {
          selector: this.elements.deleteFileConfirmationDialog.selector,
          locateStrategy: this.elements.deleteFileConfirmationBtn.locateStrategy,
          property: 'display',
          value: 'none'
        }
      )
        .useCss()
    },
    /**
     *
     * @param {string} folder
     */
    navigateToFolder: async function (folder) {
      await this.waitForFileVisible(folder)

      await this.useXpath()
        .moveToElement(this.getFileRowSelectorByFileName(folder), 0, 0)
        .click(this.getFileLinkSelectorByFileName(folder))
        .useCss()
        .waitForElementNotPresent('@filesListProgressBar')

      return this
    },
    /**
     * opens sidebar for given resource
     *
     * @param {string} resource
     * @returns {*}
     */
    openSideBar: async function (resource) {
      await this.clickRow(resource)
      return this.api.page.FilesPageElement.appSideBar()
    },
    /**
     * opens file-actions menu for given resource
     *
     * @param {string} resource name
     * @param {string} resource type (file|folder)
     *
     * @returns {*}
     */
    openFileActionsMenu: function (resource, elementType = 'file') {
      const fileActionsBtnSelector = this.getFileActionBtnSelector(resource, elementType)
      this
        .useXpath()
        .waitForElementVisible(fileActionsBtnSelector)
        .click(fileActionsBtnSelector)
        .useCss()
      return this.api.page.FilesPageElement.fileActionsMenu()
    },

    /**
     *
     * @param {string} path
     */
    markAsFavorite: async function (path) {
      await this.waitForFileVisible(path)

      const favoriteIconButton = this.getFileRowSelectorByFileName(path) +
        this.elements.notMarkedFavoriteInFileRow.selector

      await this.initAjaxCounters()
        .useXpath()
        .click(favoriteIconButton)
        .waitForOutstandingAjaxCalls()
        .useCss()

      return this
    },
    /**
     *
     */
    checkAllFiles: function () {
      return this.initAjaxCounters()
        .waitForElementVisible('@filesTable')
        .waitForElementVisible('@checkBoxAllFiles')
        .click('@checkBoxAllFiles')
    },

    /**
     * Restores all the selected files/folders
     *
     */
    restoreSelected: function () {
      return this.initAjaxCounters()
        .waitForElementVisible('@restoreSelectedButton')
        .useXpath()
        .click('@restoreSelectedButton')
        .waitForOutstandingAjaxCalls()
    },

    /**
     * @param {string} path
     */
    unmarkFavorite: async function (path) {
      const unFavoriteBtn = this.getFileRowSelectorByFileName(path) +
        this.elements.markedFavoriteInFileRow.selector

      await this.waitForFileVisible(path)

      await this.initAjaxCounters()
        .useXpath()
        .click(unFavoriteBtn)
        .waitForOutstandingAjaxCalls()
        .useCss()

      return this
    },
    /**
     * @param {string} item the file/folder to click
     */
    clickRow: async function (item) {
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
    toggleFileOrFolderCheckbox: async function (enableOrDisable, path) {
      await this.waitForFileVisible(path)

      const fileCheckbox = this.getFileRowSelectorByFileName(path) +
        this.elements.checkboxInFileRow.selector

      await this.toggleCheckbox(enableOrDisable, fileCheckbox, 'xpath')

      return this
    },
    /**
     *
     * @param {string} path
     *
     * @return {Promise<boolean>}
     */
    isMarkedFavorite: async function (path) {
      let visible = false
      const markedFavoriteIcon = this.getFileRowSelectorByFileName(path) +
        this.elements.markedFavoriteInFileRow.selector
      await this.waitForFileVisible(path)
      await this.api
        .element('xpath', markedFavoriteIcon, (result) => {
          visible = !!result.value.ELEMENT
        })
      return visible
    },
    /**
     * Wait for A filerow with given filename to be visible
     *
     * @param {string} fileName
     * @param {string} elementType
     */
    waitForFileVisible: async function (fileName, elementType = 'file') {
      const linkSelector = this.getFileLinkSelectorByFileName(fileName, elementType)

      await this.waitForElementPresent('@filesTableContainer')
      await this.filesListScrollToTop()
      // Find the item in files list if it's not in the view
      await this.findItemInFilesList(fileName)
      await this
        .useXpath()
        .getAttribute(linkSelector, 'filename', function (result) {
          if (result.value.error) {
            this.assert.fail(result.value.error)
          }
          this.assert.strictEqual(result.value, fileName, 'displayed file name not as expected')
        })
        .useCss()
      return this
    },
    /**
     * Wait for A filerow with given path to be visible
     * This only works in the favorites page as it uses the whole path of a file rather than just the name
     * This does not works in cases where the path starts with a space (eg. "  ParentFolder/file.txt")
     *
     * @param {string} path
     * @param {string} elementType
     */
    waitForFileWithPathVisible: function (path, elementType = 'file') {
      const linkSelector = this.getFileLinkSelectorByFileName(path, elementType)
      const rowSelector = this.getFileRowSelectorByFileName(path, elementType)
      return this
        .useXpath()
        .waitForElementVisible(rowSelector)
        .getAttribute(linkSelector, 'innerText', function (result) {
          this.assert.strictEqual(result.value.trim(), path, 'displayed file name not as expected')
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
    getFileRowSelectorByFileName: function (fileName, elementType = 'file') {
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

    getFileLinkSelectorByFileName: function (fileName, elementType) {
      return this.getFileRowSelectorByFileName(fileName, elementType) +
        this.elements.fileLinkInFileRow.selector
    },
    /**
     * checks whether the element is listed or not on the filesList
     *
     * @param {string} element Name of the file/folder/resource
     * @param {string} elementType
     * @returns {boolean}
     */
    isElementListed: async function (element, elementType = 'file') {
      let isListed = true
      await this
        .waitForElementVisible('@filesTable')
        .useXpath()
        .waitForElementNotPresent('@loadingIndicator')
        .api.elements(
          'xpath',
          this.getFileRowSelectorByFileName(element, elementType),
          (result) => {
            isListed = result.value.length > 0
          })
        .useCss()
      return isListed
    },
    /**
     * @returns {Array} array of files/folders element
     */
    allFileRows: async function () {
      let returnResult = null
      await this
        .waitForElementNotPresent('@filesListProgressBar')
      await this.api.elements('css selector', this.elements.fileRows, function (result) {
        returnResult = result
      })
      return returnResult
    },
    /**
     * Returns whether the empty folder message is visible
     *
     * @return {Boolean} true if the message is visible, false otherwise
     */
    isNoContentMessageVisible: async function () {
      let visible = false
      let elementId = null
      await this.waitForElementNotPresent('@filesListProgressBar')
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
    countFilesAndFolders: async function () {
      let filesCount = 0
      let foldersCount = 0

      await this.waitForElementVisible('@filesCount')
        .getText('@filesCount', result => {
          filesCount = parseInt(result.value, 10)
        })

      await this.waitForElementVisible('@foldersCount')
        .getText('@foldersCount', result => {
          foldersCount = parseInt(result.value, 10)
        })

      return filesCount + foldersCount
    },

    /**
     * Find an item in the files list. Scrolls down in case the item is not visible in viewport
     */
    findItemInFilesList: async function (itemName) {
      // Escape double quotes inside of selector
      if (itemName.indexOf('"') > -1) {
        itemName = this.replaceChar(itemName, '"', '\\"')
      }

      await this.waitForElementVisible('@virtualScrollWrapper')
      await this.api.executeAsync(
        function (
          {
            itemName,
            scrollWrapperSelector,
            listHeaderSelector
          },
          done
        ) {
          const virtualScrollWrapper = document.querySelector(scrollWrapperSelector)
          const tableHeaderPosition = document.querySelector(listHeaderSelector).getBoundingClientRect().top
          let scrollDistance = virtualScrollWrapper.scrollTop

          function scrollUntilElementVisible () {
            const item = document.querySelector(`[filename="${itemName}"]`)

            if (item) {
              const position = item.getBoundingClientRect()
              // Add position from top to list container height to properly decide if the item is visible
              const visiblePosition = virtualScrollWrapper.clientHeight + tableHeaderPosition

              // Check if the item is inside the view after it's renredered
              if (position.top > -1 && position.top <= visiblePosition) {
                done()
                return
              }
            }

            if (virtualScrollWrapper.scrollHeight <= scrollDistance) {
              done()
              return
            }

            scrollDistance += virtualScrollWrapper.clientHeight
            virtualScrollWrapper.scrollTop = scrollDistance
            setTimeout(function () {
              scrollUntilElementVisible()
            }, 500)
          }

          scrollUntilElementVisible()
        }, [{
          itemName: itemName,
          scrollWrapperSelector: this.elements.virtualScrollWrapper.selector,
          listHeaderSelector: this.elements.filesTableHeader.selector
        }])

      return this
    },

    /**
     * Scroll the files list to the beginning
     */
    filesListScrollToTop: async function () {
      await this.waitForElementVisible('@virtualScrollWrapper')
      await this.api.executeAsync(function (scrollerContainerSelector, done) {
        const filesListScroll = document.querySelector(scrollerContainerSelector)
        if (filesListScroll.scrollTop > 0) {
          filesListScroll.scrollTop = 0
        }

        done()
      }, [this.elements.virtualScrollWrapper.selector])

      return this
    },

    getShareIndicatorsForResource: async function (fileName) {
      const resourceRowXpath = this.getFileRowSelectorByFileName(fileName)
      const shareIndicatorsXpath = resourceRowXpath + this.elements.shareIndicatorsInFileRow.selector
      const indicators = []

      await this.waitForFileVisible(fileName)

      await this
        .api.elements(
          this.elements.shareIndicatorsInFileRow.locateStrategy,
          shareIndicatorsXpath,
          (result) => {
            result.value.forEach(element => {
              return this.api.elementIdAttribute(element.ELEMENT, 'class', (attr) => {
                if (attr.value.indexOf('uk-invisible') >= 0) {
                  return
                }
                return this.api.elementIdAttribute(element.ELEMENT, 'aria-label', (attr) => {
                  switch (attr.value) {
                    case 'Directly shared with collaborators':
                      indicators.push('user-direct')
                      break
                    case 'Shared with collaborators through one of the parent folders':
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

    setSort: async function (column, isDesc = false) {
      const columnSelector = util.format(this.elements.filesTableHeaderColumn.selector, xpathHelper.buildXpathLiteral(column))
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

    getCollaboratorsForResource: async function (fileName) {
      const resourceRowXpath = this.getFileRowSelectorByFileName(fileName)
      const collaboratorsXpath = resourceRowXpath + this.elements.collaboratorsInFileRow.selector
      const collaborators = []

      await this.waitForFileVisible(fileName)

      await this
        .api.elements(
          this.elements.collaboratorsInFileRow.locateStrategy,
          collaboratorsXpath,
          (result) => {
            result.value.forEach(element => {
              return this.api.elementIdText(element.ELEMENT, (attr) => {
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
    replaceChar: function (string, targetChar, newChar) {
      const regex = new RegExp(targetChar, 'g')
      return string.replace(regex, newChar)
    }
  },
  elements: {
    filesTable: {
      selector: '#files-list, #shared-with-list'
    },
    filesTableContainer: {
      selector: '#files-list-container'
    },
    fileRows: {
      selector: '.file-row'
    },
    allFiles: {
      selector: 'span.oc-file.file-row-name'
    },
    loadingIndicator: {
      selector: '//*[contains(@class, "oc-loader")]',
      locateStrategy: 'xpath'
    },
    filesListProgressBar: {
      selector: '#files-list-progress'
    },
    filesListNoContentMessage: {
      selector: '#files-list-container .files-list-no-content-message'
    },
    deleteFileConfirmationDialog: {
      selector: '#delete-file-confirmation-dialog',
      locateStrategy: 'css selector'
    },
    deleteFileConfirmationBtn: {
      selector: '#oc-dialog-delete-confirm'
    },
    shareButtonInFileRow: {
      selector: '//button[@aria-label="Collaborators"]',
      locateStrategy: 'xpath'
    },
    fileRowByName: {
      selector: '//span[@class="oc-file-name"][text()=%s and not(../span[@class="oc-file-extension"])]/../../../../../div[@data-is-visible="true"]'
    },
    fileRowByNameAndExtension: {
      selector: '//span[span/text()=%s and span/text()="%s"]/../../../../div[@data-is-visible="true"]'
    },
    fileLinkInFileRow: {
      selector: '//span[contains(@class, "file-row-name")]'
    },
    notMarkedFavoriteInFileRow: {
      selector: '//span[contains(@class, "oc-star-dimm")]',
      locateStrategy: 'xpath'
    },
    markedFavoriteInFileRow: {
      selector: '//span[contains(@class, "oc-star-shining")]',
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
      selector: '#filelist-check-all'
    },
    checkboxInFileRow: {
      selector: '//input[@type="checkbox"]',
      locateStrategy: 'xpath'
    },
    restoreSelectedButton: {
      selector: '//span[contains(text(),"Restore selected")]',
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
      selector: '#files-table-header'
    },
    filesTableHeaderColumn: {
      selector: '//*[contains(@class, "oc-sortable-column-header")]//*[text()=%s]/ancestor::button',
      locateStrategy: 'xpath'
    }
  }
}
