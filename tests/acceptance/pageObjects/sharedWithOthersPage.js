const navigationHelper = require('../helpers/navigationHelper')
const { join } = require('../helpers/path')

module.exports = {
  url: function() {
    return join(this.api.launchUrl, '/#/files/list/shared-with-others/')
  },
  commands: {
    /**
     * like build-in navigate() but also waits till for the progressbar to appear and disappear
     * @returns {*}
     */
    navigateAndWaitTillLoaded: function() {
      return navigationHelper.navigateAndWaitTillLoaded(
        this.url(),
        this.page.FilesPageElement.filesList().elements.filesListProgressBar
      )
    },
    getCollaboratorsForResource: async function(fileName) {
      const collaborators = []
      const requiredXpath =
        this.api.page.FilesPageElement.filesList().getFileRowSelectorByFileName(fileName) +
        this.elements.collaboratorsInFileRow.selector
      await this.waitForElementVisible({
        locateStrategy: this.elements.collaboratorsInFileRow.locateStrategy,
        selector: requiredXpath
      }).api.getText(this.elements.collaboratorsInFileRow.locateStrategy, requiredXpath, result => {
        result.value.forEach(element => {
          return this.api.elementIdText(element.ELEMENT, attr => {
            collaborators.push(attr.value)
          })
        })
      })
      return collaborators
    }
  },
  elements: {
    collaboratorsInFileRow: {
      selector: '//div[contains(@class, "oc-table-files-people")]//div',
      locateStrategy: 'xpath'
    }
  }
}
