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
      move: 'move',
      copy: 'copy',
      mediaViewer: 'mediaViewer',
      markdownEditor: 'markdownEditor'
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
      await this.useXpath()
        .performFileAction(this.FileAction.rename)
        .waitForElementVisible('@dialog')
        .waitForAnimationToFinish()
        .clearValue('@dialogInput')
        .setValue('@dialogInput', toName)
        .waitForAnimationToFinish()
        .click('@dialogConfirmBtn')
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
    restore: function() {
      return this.performFileAction(this.FileAction.restore)
    },
    /**
     * @return {Promise<module.exports.commands>}
     */
    download: function() {
      return this.performFileAction(this.FileAction.download)
    },
    /**
     * @return {Promise<module.exports.commands>}
     */
    deleteResourceImmediately: async function() {
      this.performFileAction(this.FileAction.delete)
      await this.api.page.FilesPageElement.filesList().confirmDeletion()

      return this
    },
    /**
     * Trigger the move of a resource via its file action
     */
    move: function() {
      return this.performFileAction(this.FileAction.move)
    },
    /**
     * Trigger the copy of a resource via its file action
     */
    copy: function() {
      return this.performFileAction(this.FileAction.copy)
    },
    /**
     * Open a resource in the media viewer via its file action
     */
    mediaViewer: function() {
      return this.performFileAction(this.FileAction.mediaViewer)
    },
    /**
     * Open a resource in the markdown editor via its file action
     */
    markdownEditor: function() {
      return this.performFileAction(this.FileAction.markdownEditor)
    }
  },
  elements: {
    sharingSideBar: {
      selector: '#oc-files-sharing-sidebar'
    },
    actionsAccordion: {
      selector: '//ul[@id="oc-files-actions-sidebar"]/li',
      locateStrategy: 'xpath'
    },
    deleteButtonInAccordion: {
      selector: '//button[normalize-space()="Delete"]',
      locateStrategy: 'xpath'
    },
    downloadButtonInAccordion: {
      selector: '//button[normalize-space()="Download"]',
      locateStrategy: 'xpath'
    },
    favoriteButtonInAccordion: {
      selector: '//button[normalize-space()="Mark as favorite"]',
      locateStrategy: 'xpath'
    },
    unmarkFavoriteButtonInAccordion: {
      selector: '//button[normalize-space()="Unmark as favorite"]',
      locateStrategy: 'xpath'
    },
    restoreButtonInAccordion: {
      selector: '//button[normalize-space()="Restore"]',
      locateStrategy: 'xpath'
    },
    renameButtonInAccordion: {
      selector: '//button[normalize-space()="Rename"]',
      locateStrategy: 'xpath'
    },
    // TODO: Merge with selectors in personalPage
    dialog: {
      selector: '.oc-modal'
    },
    dialogConfirmBtn: {
      selector: '.oc-modal-body-actions-confirm'
    },
    dialogInput: {
      selector: '.oc-modal-body-input .oc-text-input'
    },
    moveButtonInAccordion: {
      selector: '//button[normalize-space()="Move"]',
      locateStrategy: 'xpath'
    },
    copyButtonInAccordion: {
      selector: '//button[normalize-space()="Copy"]',
      locateStrategy: 'xpath'
    },
    mediaViewerButtonInAccordion: {
      selector: '//button[normalize-space()="Open in Mediaviewer"]',
      locateStrategy: 'xpath'
    },
    markdownEditorButtonInAccordion: {
      selector: '//button[normalize-space()="Open in MarkdownEditor"]',
      locateStrategy: 'xpath'
    }
  }
}
