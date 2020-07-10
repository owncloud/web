module.exports = {
  commands: {
    /**
     * @enum {string}
     * @readonly
     */
    FileAction: Object.freeze({
      download: 'download',
      delete: 'delete',
      favorite: 'favorite',
      unmarkFavorite: 'unmarkFavorite',
      restore: 'restore',
      rename: 'rename',
      deleteImmediately: 'deleteImmediately',
      move: 'move',
      copy: 'copy'
    }),

    /**
     * Action button selector
     *
     * @param {string} action
     * @returns {string}
     */
    getActionSelector: function(action) {
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
    performFileAction: function(action) {
      const fileActionBtnSelectorXpath = this.getActionSelector(action)
      return this.useXpath()
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
    getActionDisabledAttr: async function(action) {
      let disabledState
      const btnSelector = this.getActionSelector(action)
      await this.api.element('xpath', btnSelector, result => {
        // action is disabled when not visible in dropdown menu
        disabledState = result.status === -1
      })

      return disabledState
    },
    /**
     * deletes resource using fileActions 'delete' button
     * @returns {Promise<*>}
     */
    delete: async function() {
      this.performFileAction(this.FileAction.delete)
      await this.api.page.FilesPageElement.filesList().confirmDeletion()
      return this
    },
    /**
     * @param {string} toName
     * @param {boolean} expectToSucceed
     * @return {*}
     */
    rename: function(toName, expectToSucceed = true) {
      this.initAjaxCounters()
        .useXpath()
        .performFileAction(this.FileAction.rename)
        .waitForElementVisible('@dialog')
        .waitForAnimationToFinish()
        .clearValue('@dialogInput')
        .setValue('@dialogInput', toName)
        .click('@dialogConfirmBtn')
        .waitForOutstandingAjaxCalls()
        .useCss()

      if (expectToSucceed) {
        this.waitForElementNotPresent('@dialog')
      }

      return this
    },
    /**
     * mark as favorite resource using fileActions 'favorite' button
     * @returns {Promise<*>}
     */
    favorite: function() {
      return this.performFileAction(this.FileAction.favorite)
    },
    /**
     * unmark as favorite resource using fileActions 'favorite' button
     * @returns {Promise<*>}
     */
    unmarkFavorite: function() {
      return this.performFileAction(this.FileAction.unmarkFavorite)
    },
    /**
     * @return {Promise<module.exports.commands>}
     */
    restore: async function() {
      await this.initAjaxCounters()
        .useXpath()
        .performFileAction(this.FileAction.restore)
        .waitForOutstandingAjaxCalls()
        .useCss()
      return this
    },
    /**
     * @return {Promise<module.exports.commands>}
     */
    download: async function() {
      await this.initAjaxCounters()
        .performFileAction(this.FileAction.download)
        .waitForOutstandingAjaxCalls()
      return this
    },
    /**
     * @return {Promise<module.exports.commands>}
     */
    deleteResourceImmediately: async function() {
      this.performFileAction(this.FileAction.deleteImmediately)
      await this.api.page.FilesPageElement.filesList().confirmDeletion()

      return this
    },
    /**
     * Trigger the move of a resource via its file action
     */
    move: function() {
      this.performFileAction(this.FileAction.move)
    },
    /**
     * Trigger the copy of a resource via its file action
     */
    copy: function() {
      this.performFileAction(this.FileAction.copy)
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
    favoriteButtonInFileRow: {
      selector: '//button[@aria-label="Mark as favorite"]',
      locateStrategy: 'xpath'
    },
    unmarkFavoriteButtonInFileRow: {
      selector: '//button[@aria-label="Unmark as favorite"]',
      locateStrategy: 'xpath'
    },
    restoreButtonInFileRow: {
      selector: '//button[@aria-label="Restore"]',
      locateStrategy: 'xpath'
    },
    renameButtonInFileRow: {
      selector: '//button[@aria-label="Rename"]',
      locateStrategy: 'xpath'
    },
    deleteImmediatelyButtonInFileRow: {
      selector: '//button[@aria-label="Delete"]',
      locateStrategy: 'xpath'
    },
    // TODO: Merge with selectors in filesPage
    dialog: {
      selector: '.oc-modal'
    },
    dialogConfirmBtn: {
      selector: '.oc-modal-body-actions-confirm'
    },
    dialogInput: {
      selector: '.oc-modal-body-input > input'
    },
    moveButtonInFileRow: {
      selector: '//button[@aria-label="Move"]',
      locateStrategy: 'xpath'
    },
    copyButtonInFileRow: {
      selector: '//button[@aria-label="Copy"]',
      locateStrategy: 'xpath'
    }
  }
}
