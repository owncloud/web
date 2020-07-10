const { client } = require('nightwatch-api')

module.exports = {
  commands: {
    selectFolderAndConfirm: async function(target) {
      await client.page.FilesPageElement.filesList().navigateToFolder(target)

      return this.waitForElementVisible('@confirmBtn').click('@confirmBtn')
    }
  },
  elements: {
    confirmBtn: {
      selector: '#location-picker-btn-confirm'
    }
  }
}
