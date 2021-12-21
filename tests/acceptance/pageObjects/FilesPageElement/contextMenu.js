module.exports = {
  commands: {
    /**
     * @enum {string}
     * @readonly
     */
    ContextMenuItem: Object.freeze({
      showDetails: 'detailsButton',
      showActions: 'actionsButton',
      selectRenameFile: 'renameButton'
    }),

    /**
     * @param {string} elementName the name of the element (mapped in `ContextMenuItem`)
     */
    clickMenuItem: async function (elementName) {
      const element = this.elements[elementName]
      await this.click(element.locateStrategy, element.selector)
      return this
    },

    /**
     * Clicks the menu item for showing details
     *
     * @returns {*}
     */
    showDetails: async function () {
      await this.clickMenuItem(this.ContextMenuItem.showDetails)
      await this.waitForAnimationToFinish() // wait for sidebar animation to finish
      return this
    },

    /**
     * Clicks the menu item for showing all actions
     *
     * @returns {*}
     */
    showActions: async function () {
      await this.clickMenuItem(this.ContextMenuItem.showActions)
      await this.waitForAnimationToFinish() // wait for sidebar animation to finish
      return this
    },
    selectRenameFile: function () {
      return this.clickMenuItem(this.ContextMenuItem.selectRenameFile)
    }
  },
  elements: {
    detailsButton: {
      selector: '//button[contains(@class, "oc-files-actions-show-details-trigger")]',
      locateStrategy: 'xpath'
    },
    actionsButton: {
      selector: '//button[contains(@class, "oc-files-actions-show-actions-trigger")]',
      locateStrategy: 'xpath'
    },
    renameButton: {
      selector: '//button[contains(@class, "oc-files-actions-rename-trigger")]',
      locateStrategy: 'xpath'
    }
  }
}
