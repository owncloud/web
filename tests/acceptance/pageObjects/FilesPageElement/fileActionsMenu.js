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
      copy: 'copy',
      mediaViewer: 'mediaViewer'
    }),

    /**
     * Action button selector
     *
     * @param {string} action
     * @returns {string}
     */
    getActionSelector: function(action) {
      const actionsAccordionSelector = this.elements.actionsAccordion.selector
      const actionSelector = this.elements[action + 'ButtonInAccordion'].selector

      return `${actionsAccordionSelector}${actionSelector}`
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
    rename: async function(toName, expectToSucceed = true) {
      await this.initAjaxCounters()
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
        await this.waitForElementNotPresent('@dialog')
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
    },
    /**
     * Open a resource in the media viewer via its file action
     */
    mediaViewer: function() {
      this.performFileAction(this.FileAction.mediaViewer)
    }
  },
  elements: {
    sharingSideBar: {
      selector: '#oc-files-sharing-sidebar'
    },
    actionsAccordion: {
      selector: '//li[@id="app-sidebar-files-actions"]',
      locateStrategy: 'xpath'
    },
    deleteButtonInAccordion: {
      selector: '//button[@aria-label="Delete"]',
      locateStrategy: 'xpath'
    },
    downloadButtonInAccordion: {
      selector: '//button[@aria-label="Download"]',
      locateStrategy: 'xpath'
    },
    favoriteButtonInAccordion: {
      selector: '//button[@aria-label="Mark as favorite"]',
      locateStrategy: 'xpath'
    },
    unmarkFavoriteButtonInAccordion: {
      selector: '//button[@aria-label="Unmark as favorite"]',
      locateStrategy: 'xpath'
    },
    restoreButtonInAccordion: {
      selector: '//button[@aria-label="Restore"]',
      locateStrategy: 'xpath'
    },
    renameButtonInAccordion: {
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
    moveButtonInAccordion: {
      selector: '//button[@aria-label="Move"]',
      locateStrategy: 'xpath'
    },
    copyButtonInAccordion: {
      selector: '//button[@aria-label="Copy"]',
      locateStrategy: 'xpath'
    },
    mediaViewerButtonInAccordion: {
      selector: '//button[@aria-label="Open in Mediaviewer"]',
      locateStrategy: 'xpath'
    }
  }
}
