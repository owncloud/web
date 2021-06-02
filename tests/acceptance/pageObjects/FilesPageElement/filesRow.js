/* eslint-disable no-unused-expressions */
const { client } = require('nightwatch-api')
const util = require('util')
const filesList = client.page.FilesPageElement.filesList()

module.exports = {
  commands: {
    /**
     * Get Selector for File Actions expander
     *
     * @param {string} fileName
     * @param {string} elementType
     * @returns {string} file action button selector
     */
    getFileActionBtnSelector: function(fileName, elementType = 'any') {
      return (
        filesList.getFileRowSelectorByFileName(fileName, elementType) +
        this.elements.fileActionsButtonInFileRow.selector
      )
    },
    /**
     * opens file-actions menu for given resource
     *
     * @param {string} resource The resource name
     * @param {string} elementType The resource type (file|folder)
     *
     * @returns {*}
     */
    openFileActionsMenu: function(resource, elementType = 'any') {
      const fileActionsBtnSelector = this.getFileActionBtnSelector(resource, elementType)
      this.useXpath()
        .waitForElementVisible(fileActionsBtnSelector)
        .click(fileActionsBtnSelector)
        .useCss()
      return this.api.page.FilesPageElement.fileActionsMenu()
    },
    isQuickActionVisible: function(action) {
      action = action.replace(/\s/, '-')
      const actionSelector = util.format(this.elements.quickAction.selector, action)

      this.useXpath().expect.element(actionSelector).to.be.visible
      this.useCss()

      return this
    }
  },
  elements: {
    fileActionsButtonInFileRow: {
      selector: '//button[contains(@class, "oc-table-files-btn-show-details")]',
      locateStrategy: 'xpath'
    },
    quickAction: {
      selector: '//button[contains(@class, "files-quick-action-%s")]',
      locateStrategy: 'xpath'
    }
  }
}
