const { join } = require('../helpers/path')

module.exports = {
  url: function() {
    return join(this.api.launchUrl, '/#/files/list/trash-bin/')
  },
  commands: {
    /**
     * like build-in navigate() but also waits till for the progressbar to appear and disappear
     * @returns {*}
     */
    navigateAndWaitTillLoaded: function() {
      return this.navigate(this.url()).waitForElementPresent(
        this.page.FilesPageElement.filesList().elements.anyAfterLoading
      )
    },
    clearTrashbin: function() {
      return this.waitForElementVisible('@clearTrashbin')
        .initAjaxCounters()
        .click('@clearTrashbin')
        .waitForOutstandingAjaxCalls()
    }
  },
  elements: {
    clearTrashbin: {
      selector: '#delete-selected-btn'
    }
  }
}
