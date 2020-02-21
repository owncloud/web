module.exports = {
  commands: {
    /**
     * @enum {string}
     * @readonly
     */
    FileAction: Object.freeze({
      download: 'download',
      delete: 'delete',
      restore: 'restore',
      share: 'share',
      rename: 'rename',
      deleteImmediately: 'deleteImmediately'
    }),

    /**
     * Action button selector
     *
     * @param {string} action
     * @returns {string}
     */
    getActionSelector: function (action) {
      const actionsDropdownSelector = this.elements.itemActionsDropdown.selector
      const actionSelector = this.elements[action + 'ButtonInFileRow'].selector

      return `${actionsDropdownSelector}${actionSelector}`
    },
    /**
     * perform one of the main file actions
     *
     * @param {string} action delete|share|rename|download

     * @throws Error
     * @returns {*}
     */
    performFileAction: function (action) {
      const fileActionBtnSelectorXpath = this.getActionSelector(action)
      return this
        .useXpath()
        .waitForElementVisible(fileActionBtnSelectorXpath)
        .click(fileActionBtnSelectorXpath)
        .useCss()
    },
    /**
     * returns the disabled state of given action
     *
     * @param {string} action
     * @returns {Promise<boolean>}
     */
    getActionDisabledAttr: async function (action) {
      let disabledState
      const btnSelector = this.getActionSelector(action)
      await this
        .api.element('xpath', btnSelector, result => {
          // action is disabled when not visible in dropdown menu
          disabledState = result.status === -1
        })

      return disabledState
    },
    /**
     * deletes resource using fileActions 'delete' button
     * @returns {Promise<*>}
     */
    delete: async function () {
      this.performFileAction(this.FileAction.delete)
      await this.api.page.FilesPageElement.filesList().confirmDeletion()
      return this
    },
    /**
     * @param {string} toName
     * @param {boolean} expectToSucceed
     * @return {*}
     */
    rename: async function (toName, expectToSucceed = true) {
      await this.initAjaxCounters()
        .useXpath()
        .performFileAction(this.FileAction.rename)
        .waitForElementVisible('@renameFileConfirmationBtn')
        .waitForAnimationToFinish()
        .clearValue('@renameFileInputField')
        .setValue('@renameFileInputField', toName)
        .click('@renameFileConfirmationBtn')
        .waitForOutstandingAjaxCalls()
        .useCss()

      if (expectToSucceed) {
        await this.waitForElementNotVisible('@renameFileConfirmationDialog')
      }

      return this
    },
    /**
     * opens sharing dialog for given resource
     * assumes filesAction menu for the resource to be opened
     * @return {*}
     */
    openCollaboratorsDialog: function () {
      const api = this.api.page.FilesPageElement
      api.appSideBar().closeSidebar(500)
      this
        .useXpath()
        .performFileAction(this.FileAction.share)
        .waitForElementVisible('@sharingSideBar')
        .useCss()
      return api.sharingDialog()
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
      this
        .openCollaboratorsDialog()
        .useXpath()
        .waitForElementVisible(sidebarLinksTabXpath)
        .click(sidebarLinksTabXpath)
        .useCss()
      return api.publicLinksDialog()
    },
    /**
     * checks whether sharing button of given file-row is present
     *
     * @returns {Promise<boolean>}
     */
    isSharingBtnPresent: async function () {
      const shareButtonXpath = this.elements.shareButtonInFileRow.selector
      let isPresent = true
      await this
        .api.page.FilesPageElement.appSideBar().closeSidebar(100)
      await this
        .api.elements(
          this.elements.shareButtonInFileRow.locateStrategy,
          shareButtonXpath,
          (result) => {
            isPresent = result.value.length > 0
          })
      return isPresent
    },
    /**
     * @return {Promise<module.exports.commands>}
     */
    restore: async function () {
      await this
        .initAjaxCounters()
        .useXpath()
        .performFileAction(this.FileAction.restore)
        .waitForOutstandingAjaxCalls()
        .useCss()
      return this
    },
    /**
     * @return {Promise<module.exports.commands>}
     */
    download: async function () {
      await this
        .initAjaxCounters()
        .performFileAction(this.FileAction.download)
        .waitForOutstandingAjaxCalls()
      return this
    },
    /**
     * @return {Promise<module.exports.commands>}
     */
    deleteResourceImmediately: async function () {
      this.performFileAction(this.FileAction.deleteImmediately)
      await this.api.page.FilesPageElement.filesList().confirmDeletion()

      return this
    }
  },
  elements: {
    sharingSideBar: {
      selector: '#oc-files-sharing-sidebar'
    },
    itemActionsDropdown: {
      selector: '//div[@id="files-list-row-actions-dropdown"]',
      locateStrategy: 'xpath'
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
    fileActionsButtonInFileRow: {
      selector: '//button[contains(@class, "files-list-row-show-actions")]',
      locateStrategy: 'xpath'
    },
    shareButtonInFileRow: {
      selector: '//button[@aria-label="Collaborators"]',
      locateStrategy: 'xpath'
    },
    deleteImmediatelyButtonInFileRow: {
      selector: '//button[@aria-label="Delete"]',
      locateStrategy: 'xpath'
    }
  }
}
