const { client } = require('nightwatch-api')
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
    getFileActionBtnSelector: function(fileName, elementType = 'file') {
      return (
        filesList.getFileRowSelectorByFileName(fileName, elementType) +
        this.elements.fileActionsButtonInFileRow.selector
      )
    },
    /**
     * opens file-actions menu for given resource
     *
     * @param {string} resource name
     * @param {string} resource type (file|folder)
     *
     * @returns {*}
     */
    openFileActionsMenu: function(resource, elementType = 'file') {
      const fileActionsBtnSelector = this.getFileActionBtnSelector(resource, elementType)
      this.useXpath()
        .waitForElementVisible(fileActionsBtnSelector)
        .click(fileActionsBtnSelector)
        .useCss()
      return this.api.page.FilesPageElement.fileActionsMenu()
    }
  },
  elements: {
    fileActionsButtonInFileRow: {
      selector: '//button[contains(@class, "files-list-row-show-actions")]',
      locateStrategy: 'xpath'
    }
  }
}
