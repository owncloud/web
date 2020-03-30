const { client } = require('nightwatch-api')
const filesList = client.page.FilesPageElement.filesList()

module.exports = {
  commands: {

    /**
     *
     * @param {string} path
     */
    markAsFavorite: async function (path) {
      await filesList.waitForFileVisible(path)

      const favoriteIconButton = filesList.getFileRowSelectorByFileName(path) +
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
     * @param {string} path
     *
     * @return {Promise<boolean>}
     */
    isMarkedFavorite: async function (path) {
      let visible = false
      const markedFavoriteIcon = filesList.getFileRowSelectorByFileName(path) +
        this.elements.markedFavoriteInFileRow.selector
      await filesList.waitForFileVisible(path)
      await this.api
        .element('xpath', markedFavoriteIcon, (result) => {
          visible = !!result.value.ELEMENT
        })
      return visible
    },
    /**
     * @param {string} path
     */
    unmarkFavorite: async function (path) {
      const unFavoriteBtn = filesList.getFileRowSelectorByFileName(path) +
        this.elements.markedFavoriteInFileRow.selector

      await filesList.waitForFileVisible(path)

      await this.initAjaxCounters()
        .useXpath()
        .click(unFavoriteBtn)
        .waitForOutstandingAjaxCalls()
        .useCss()

      return this
    },
    /**
     * Get Selector for File Actions expander
     *
     * @param {string} fileName
     * @param {string} elementType
     * @returns {string} file action button selector
     */
    getFileActionBtnSelector: function (fileName, elementType = 'file') {
      return filesList.getFileRowSelectorByFileName(fileName, elementType) +
        this.elements.fileActionsButtonInFileRow.selector
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
    }
  },
  elements: {
    notMarkedFavoriteInFileRow: {
      selector: '//span[contains(@class, "oc-star-dimm")]',
      locateStrategy: 'xpath'
    },
    markedFavoriteInFileRow: {
      selector: '//span[contains(@class, "oc-star-shining")]',
      locateStrategy: 'xpath'
    },
    fileActionsButtonInFileRow: {
      selector: '//button[contains(@class, "files-list-row-show-actions")]',
      locateStrategy: 'xpath'
    }
  }
}
