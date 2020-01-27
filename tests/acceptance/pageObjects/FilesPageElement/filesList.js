const util = require('util')
const path = require('path')
const xpathHelper = require('../../helpers/xpath')
const { join } = require('../../helpers/path')

/**
 * @enum {string}
 * @readonly
 */
const FileAction = Object.freeze({
  download: 'download',
  delete: 'delete',
  restore: 'restore',
  share: 'share',
  rename: 'rename',
  deleteImmediately: 'deleteImmediately'
})
module.exports = {
  commands: {
    /**
     * Action button selector for Low Resolution screens
     *
     * @param {string} action
     * @param {string} fileName
     * @returns {string}
     */
    getActionSelectorLowRes: function (action) {
      const actionsDropdownSelector = this.elements.itemActionsDropdown.selector
      const actionSelector = this.elements[action + 'ButtonInFileRow'].selector

      return `${actionsDropdownSelector}${actionSelector}`
    },
    /**
     * Action button selector for High Resolution screens
     *
     * @param {string} action
     * @param {string} fileName
     * @returns {string}
     */
    getActionSelectorHighRes: function (action, fileName) {
      return '(' + this.getFileRowSelectorByFileName(fileName) +
        this.elements[action + 'ButtonInFileRow'].selector + ')[1]'
    },
    /**
     * Get Selector for File Actions expander
     *
     * @param fileName
     * @returns {string}
     */
    getFileActionBtnSelector: function (fileName) {
      return this.getFileRowSelectorByFileName(fileName) +
        this.elements.fileActionsButtonInFileRow.selector
    },
    /**
     * perform one of the main file actions
     * this method does find out itself if the file-action burger has to be clicked or not
     *
     * @param {string} fileName
     * @param {string} action delete|share|rename|download
     * @returns {*}
     */
    performFileAction: function (fileName, action) {
      const { btnSelectorHighResolution, btnSelectorLowResolution, fileActionsBtnSelector } =
        this.getFileRowButtonSelectorsByFileName(fileName, action)

      return this.initAjaxCounters()
        .useXpath()
        .isVisible(fileActionsBtnSelector, (result) => {
          if (result.value === true) {
            this
              .click(fileActionsBtnSelector)
              .waitForElementVisible(btnSelectorLowResolution)
              .click(btnSelectorLowResolution)
          } else {
            this
              .waitForElementVisible(btnSelectorHighResolution)
              .click(btnSelectorHighResolution)
          }
        })
    },

    /**
     * Checks whether a given action is disabled for a given file name.
     * This method does find out itself if the file-action burger has to be clicked or not.
     *
     * @param {string} fileName
     * @param {string} delete|share|rename
     * @param {function(boolean)} callback - whether the action is disabled
     * @returns {*}
     */
    isActionDisabled: function (fileName, action, callback) {
      const { btnSelectorHighResolution, btnSelectorLowResolution, fileActionsBtnSelector } =
        this.getFileRowButtonSelectorsByFileName(fileName, action)

      return this
        .useXpath()
        .moveToElement(this.getFileRowSelectorByFileName(fileName), 0, 0)
        .isVisible(fileActionsBtnSelector, (result) => {
          let btnSelector
          if (result.value === true) {
            this
              .click(fileActionsBtnSelector)
            btnSelector = btnSelectorLowResolution
          } else {
            btnSelector = btnSelectorHighResolution
          }

          this
            .waitForElementVisible(btnSelector)
            .useXpath()
            .getAttribute(btnSelector, 'disabled', (disabledResult) => {
              const isDisabled = disabledResult.value === 'true'
              callback(isDisabled)
            })
        })
    },
    /**
     *
     * @param {string} fileName
     */
    deleteFile: async function (fileName) {
      await this.waitForFileVisible(fileName)

      await this
        .useXpath()
        .performFileAction(fileName, FileAction.delete)
        .confirmDeletion()

      return this
    },
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
     * @param {string} fileName
     */
    restoreFile: function (fileName) {
      return this.initAjaxCounters()
        .waitForFileWithPathVisible(fileName)
        .useXpath()
        .performFileAction(fileName, FileAction.restore)
        .waitForOutstandingAjaxCalls()
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
     *
     * @param {string} fileName
     */
    openSharingDialog: async function (fileName, targetTab = 'collaborators') {
      await this.waitForFileVisible(fileName)

      await this
        .useXpath()
        .performFileAction(fileName, FileAction.share)
        .waitForElementVisible('@sharingSideBar')
        .useCss()

      if (targetTab === 'links') {
        await this
          .waitForElementVisible('@sidebarLinksTab')
          .click('@sidebarLinksTab')
      }

      return this.api.page.FilesPageElement.sharingDialog()
    },
    /**
     *
     * @param {string} fileName
     */
    openPublicLinkDialog: async function (fileName) {
      await this.waitForFileVisible(fileName)

      await this
        .useXpath()
        .performFileAction(fileName, FileAction.share)
        .waitForElementVisible('@linkToPublicLinksTag')
        .click('@linkToPublicLinksTag')
        .waitForElementVisible('@publicLinkSideBar')
        .useCss()

      return this.api.page.FilesPageElement.publicLinksDialog()
    },
    closeSidebar: function (timeout = null) {
      if (timeout === null) {
        timeout = this.api.globals.waitForConditionTimeout
      } else {
        timeout = parseInt(timeout, 10)
      }
      try {
        this.click({
          selector: '@sidebarCloseBtn',
          timeout: timeout
        })
      } catch (e) {
        // do nothing
      }
      return this.api.page.FilesPageElement.filesList()
    },
    /**
     *
     * @param {string} fromName
     * @param {string} toName
     * @param {boolean} expectToSucceed
     */
    renameFile: async function (fromName, toName, expectToSucceed = true) {
      await this.waitForFileVisible(fromName)

      await this.initAjaxCounters()
        .useXpath()
        .performFileAction(fromName, FileAction.rename)
        .waitForElementVisible('@renameFileConfirmationBtn')
        .waitForAnimationToFinish()
        .clearValue('@renameFileInputField')
        .setValueBySingleKeys('@renameFileInputField', toName)
        .click('@renameFileConfirmationBtn')
        .waitForOutstandingAjaxCalls()
        .useCss()

      if (expectToSucceed) {
        await this.waitForElementNotVisible('@renameFileConfirmationDialog')
      }

      return this
    },
    /**
     *
     * @param {string} fromName
     */
    downloadFile: async function (fromName) {
      await this.waitForFileVisible(fromName)

      await this.initAjaxCounters()
        .performFileAction(fromName, FileAction.download)
        .waitForOutstandingAjaxCalls()
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
        .clickElementAt(this.getFileRowSelectorByFileName(item), 0, 0)
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
     */
    waitForFileVisible: async function (fileName) {
      const linkSelector = this.getFileLinkSelectorByFileName(fileName)

      await this.waitForElementPresent('@filesTableContainer')
      await this.filesListScrollToTop()
      await this.findItemInFilesList(fileName)

      // Find the item in files list if it's not in the view
      await this
        .useXpath()
        .getAttribute(linkSelector, 'filename', function (result) {
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
     */
    waitForFileWithPathVisible: function (path) {
      const rowSelector = this.getFileRowSelectorByFileName(path)
      const linkSelector = this.getFileLinkSelectorByFileName(path)
      return this
        .useXpath()
        .waitForElementVisible(rowSelector)
        .getAttribute(linkSelector, 'innerText', function (result) {
          this.assert.strictEqual(result.value.trim(), path, 'displayed file name not as expected')
        })
        .useCss()
    },
    getFileRowButtonSelectorsByFileName: function (fileName, action) {
      const btnSelectorHighResolution = this.getActionSelectorHighRes(action, fileName)
      const btnSelectorLowResolution = this.getActionSelectorLowRes(action, fileName)
      const fileActionsBtnSelector = this.getFileActionBtnSelector(fileName)

      return { btnSelectorHighResolution, btnSelectorLowResolution, fileActionsBtnSelector }
    },
    /**
     *
     * @param {string} fileName
     *
     * @returns {string}
     */
    getFileRowSelectorByFileName: function (fileName) {
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

      const element = this.elements.fileRowByName
      return util.format(element.selector, xpathHelper.buildXpathLiteral(fileName))
    },
    /**
     *
     * @param {string} fileName
     */
    getFileLinkSelectorByFileName: function (fileName) {
      return this.getFileRowSelectorByFileName(fileName) +
        this.elements.fileLinkInFileRow.selector
    },
    /**
     * checks whether the element is listed or not on the filesList
     *
     * @param {string} element Name of the file/folder/resource
     * @returns {boolean}
     */
    isElementListed: async function (element) {
      let isListed = true
      await this
        .waitForElementVisible('@filesTable')
        .useXpath()
        .waitForElementNotPresent('@loadingIndicator')
        .api.elements(
          'xpath',
          this.getFileRowSelectorByFileName(element),
          (result) => {
            isListed = result.value.length > 0
          })
        .useCss()
      return isListed
    },
    /**
     * checks whether sharing button of given file-row is present
     *
     * @param {string} fileName
     * @returns {Promise<boolean>}
     */
    isSharingBtnPresent: async function (fileName) {
      const resourceRowXpath = this.getFileRowSelectorByFileName(fileName)
      const shareButtonXpath = this.elements.shareButtonInFileRow.selector
      const resourceShareButtonXpath = resourceRowXpath + shareButtonXpath
      let isPresent = true
      await this
        .closeSidebar(100)
        .api.elements(
          this.elements.shareButtonInFileRow.locateStrategy,
          resourceShareButtonXpath,
          (result) => {
            isPresent = result.value.length > 0
          })
      return isPresent
    },
    /**
     * checks if the given tabs are present on the files-page-sidebar
     *
     * @param {string} rowSelector xpath for given resource row selector
     * @param {string} tabSelector xpath for given tab
     * @returns {Promise<boolean>}
     */
    isSidebarTabPresent: async function (rowSelector, tabSelector) {
      let isPresent = true
      await this
        .closeSidebar(100)
        .useXpath()
        .click(rowSelector)
        .waitForElementVisible('@sidebar')
        .api.elements(
          'xpath',
          tabSelector,
          (result) => {
            isPresent = result.value.length > 0
          })
        .useCss()
      return isPresent
    },
    /**
     *
     * @param {string} fileName
     * @returns {Promise<boolean>}
     */
    isSidebarLinksTabPresent: function (fileName) {
      return this.isSidebarTabPresent(
        this.getFileRowSelectorByFileName(fileName),
        this.elements.sidebarLinksTab.selector
      )
    },
    /**
     *
     * @param {string} fileName
     * @returns {Promise<boolean>}
     */
    isSidebarCollaboratorsTabPresent: function (fileName) {
      return this.isSidebarTabPresent(
        this.getFileRowSelectorByFileName(fileName),
        this.elements.sidebarCollaboratorsTab.selector
      )
    },
    /**
     * returns the disabled state of given action
     *
     * @param {string} action
     * @param {string} fileName
     * @returns {Promise<boolean>}
     */
    getActionDisabledAttr: async function (action, fileName) {
      const btnSelectorHighResolution = this.getActionSelectorHighRes(action, fileName)
      const btnSelectorLowResolution = this.getActionSelectorLowRes(action, fileName)
      const fileActionsBtnSelector = this.getFileActionBtnSelector(fileName)
      let disabledState
      await this
        .useXpath()
        .moveToElement(this.getFileRowSelectorByFileName(fileName), 0, 0)
        .isVisible(fileActionsBtnSelector, (result) => {
          if (result.value === true) {
            this.click(fileActionsBtnSelector)
              .waitForElementVisible(btnSelectorLowResolution)
              .getAttribute(btnSelectorLowResolution, 'disabled', result => {
                disabledState = result.value
              })
          } else {
            this.waitForElementVisible(btnSelectorHighResolution)
              .getAttribute(btnSelectorHighResolution, 'disabled', result => {
                disabledState = result.value
              })
          }
        })
        .useCss()
      return disabledState
    },
    /**
     *
     * @returns {Promise.<[]>} Array of files/folders element
     */
    allFileRows: async function () {
      await this
        .waitForElementNotPresent('@filesListProgressBar')
        .waitForElementVisible({
          selector: '@fileRows',
          abortOnFailure: false
        })
      return new Promise((resolve, reject) => {
        this.api.elements('css selector', this.elements.fileRows, function (result) {
          resolve(result)
        })
      })
    },
    getListedFilesFolders: function () {
      this
        .waitForElementNotPresent('@filesListProgressBar')
        .waitForElementVisible({
          selector: '@allFiles',
          abortOnFailure: false
        })
      return new Promise((resolve, reject) => {
        this.api.elements('@allFiles', function (result) {
          resolve(result)
        })
      })
    },
    copyPrivateLink: function () {
      return this
        .waitForElementVisible('@sidebar')
        .waitForElementVisible('@sidebarLinksTab')
        .click('@sidebarLinksTab')
        .waitForElementVisible('@sidebarPrivateLinkLabel')
        .click('@sidebarPrivateLinkLabel')
        .waitForElementNotVisible('@sidebarPrivateLinkLabel')
        .waitForElementVisible('@sidebarPrivateLinkIconCopied')
        .waitForElementNotVisible('@sidebarPrivateLinkIconCopied')
        .waitForElementVisible('@sidebarPrivateLinkLabel')
    },
    deleteImmediately: async function (fileName) {
      await this.waitForFileVisible(fileName)
      await this
        .performFileAction(fileName, FileAction.deleteImmediately)
        .confirmDeletion()

      return this
    },
    getVersions: async function (filename) {
      const formattedFileRow = this.getFileRowSelectorByFileName(filename)

      await this.waitForFileVisible(filename)

      await this
        .useXpath()
        .click(formattedFileRow)
        .waitForElementVisible('@versionsElement')
        .click('@versionsElement')

      return this
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

      await this.api.executeAsync(
        function (
          {
            itemName,
            listContainerSelector,
            scrollWrapperSelector,
            listHeaderSelector
          },
          done
        ) {
          const filesListContainer = document.querySelector(listContainerSelector)
          const virtualScrollWrapper = document.querySelector(scrollWrapperSelector)
          const tableHeaderPosition = document.querySelector(listHeaderSelector).getBoundingClientRect().top
          let scrollDistance = filesListContainer.scrollTop

          function scrollUntilElementVisible () {
            const item = document.querySelector(`[filename="${itemName}"]`)

            if (item) {
              const position = item.getBoundingClientRect()
              // Add position from top to list container height to properly decide if the item is visible
              const visiblePosition = filesListContainer.clientHeight + tableHeaderPosition

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

            scrollDistance += filesListContainer.clientHeight
            filesListContainer.scrollTop = scrollDistance
            setTimeout(function () {
              scrollUntilElementVisible()
            }, 500)
          }

          scrollUntilElementVisible()
        }, [{
          itemName: itemName,
          listContainerSelector: this.elements.filesTableContainer.selector,
          scrollWrapperSelector: this.elements.virtualScrollWrapper.selector,
          listHeaderSelector: this.elements.filesTableHeader.selector
        }])

      return this
    },

    /**
     * Scroll the files list to the beginning
     */
    filesListScrollToTop: async function () {
      await this.api.executeAsync(function (listContainerSelector, done) {
        const filesListScroll = document.querySelector(listContainerSelector)
        if (filesListScroll.scrollTop > 0) {
          filesListScroll.scrollTop = 0
        }

        done()
      }, [this.elements.filesTableContainer.selector])

      return this
    },

    getShareIndicatorsForResource: async function (fileName) {
      const resourceRowXpath = this.getFileRowSelectorByFileName(fileName)
      const shareIndicatorsXpath = resourceRowXpath + this.elements.shareIndicatorsInFileRow.selector
      const indicators = []
      await this
        .useXpath()
        .moveToElement(resourceRowXpath, 0, 0)
        .api.elements(
          this.elements.shareIndicatorsInFileRow.locateStrategy,
          shareIndicatorsXpath,
          (result) => {
            result.value.forEach(async element => {
              await this.api.elementIdAttribute(element.ELEMENT, 'aria-label', (attr) => {
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
          }
        )
      return indicators
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
    fileActionsButtonInFileRow: {
      selector: '//button[@aria-label="show-file-actions"]',
      locateStrategy: 'xpath'
    },
    deleteFileConfirmationDialog: {
      selector: '#delete-file-confirmation-dialog',
      locateStrategy: 'css selector'
    },
    deleteButtonInFileRow: {
      selector: '//button[@aria-label="Delete"]',
      locateStrategy: 'xpath'
    },
    downloadButtonInFileRow: {
      selector: '//button[@aria-label="Download"]',
      locateStrategy: 'xpath'
    },
    restoreButtonInFileRow: {
      selector: '//button[@aria-label="Restore"]',
      locateStrategy: 'xpath'
    },
    deleteImmediatelyButtonInFileRow: {
      selector: '//button[@aria-label="Delete"]',
      locateStrategy: 'xpath'
    },
    deleteFileConfirmationBtn: {
      selector: '#oc-dialog-delete-confirm'
    },
    shareButtonInFileRow: {
      selector: '//button[@aria-label="Collaborators"]',
      locateStrategy: 'xpath'
    },
    renameFileConfirmationDialog: {
      selector: '#change-file-dialog'
    },
    renameButtonInFileRow: {
      selector: '//button[@aria-label="Rename"]',
      locateStrategy: 'xpath'
    },
    renameFileInputField: {
      selector: '//div[@id="change-file-dialog"]//input',
      locateStrategy: 'xpath'
    },
    renameFileConfirmationBtn: {
      selector: '#oc-dialog-rename-confirm'
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
    shareIndicatorsInFileRow: {
      selector: '//*[contains(@class, "file-row-share-indicator")]',
      locateStrategy: 'xpath'
    },
    sharingSideBar: {
      selector: '#oc-files-sharing-sidebar'
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
    sidebarCloseBtn: {
      selector: '//div[@class="sidebar-container"]//div[@class="action"]//button',
      locateStrategy: 'xpath'
    },
    sidebar: {
      selector: '#files-sidebar'
    },
    sidebarPrivateLinkLabel: {
      selector: '#files-sidebar-private-link-label'
    },
    sidebarPrivateLinkIconCopied: {
      selector: '#files-sidebar-private-link-icon-copied'
    },
    sidebarLinksTab: {
      selector: '//div[@class="sidebar-container"]//a[contains(text(),"Links")]',
      locateStrategy: 'xpath'
    },
    sidebarCollaboratorsTab: {
      selector: '//div[@class="sidebar-container"]//a[contains(text(),"Collaborators")]',
      locateStrategy: 'xpath'
    },
    versionsElement: {
      selector: '//div//a[normalize-space(.)="Versions"]',
      locateStrategy: 'xpath'
    },
    collaboratorsList: {
      selector: '.files-collaborators-lists'
    },
    itemActionsDropdown: {
      selector: '//div[@id="files-list-row-actions-dropdown"]',
      locateStrategy: 'xpath'
    },
    foldersCount: {
      selector: '#files-list-count-folders'
    },
    filesCount: {
      selector: '#files-list-count-files'
    },
    virtualScrollWrapper: {
      selector: '.vue-recycle-scroller__item-wrapper'
    },
    filesTableHeader: {
      selector: '#files-table-header'
    }
  }
}
