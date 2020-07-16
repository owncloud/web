const { client } = require('nightwatch-api')

module.exports = {
  commands: {
    selectFolderAndConfirm: async function(target) {
      const targetSplitted = target.split('/')
      for (let i = 0; i < targetSplitted.length; i++) {
        await client.page.FilesPageElement.filesList().navigateToFolder(targetSplitted[i])
      }

      return this.waitForElementVisible('@confirmBtn').click('@confirmBtn')
    },
    selectFolder: async function(target) {
      const targetSplitted = target.split('/')
      for (let i = 0; i < targetSplitted.length; i++) {
        await client.page.FilesPageElement.filesList().navigateUptoFolder(targetSplitted[i])
      }
      return this
    }
  },
  elements: {
    confirmBtn: {
      selector: '#location-picker-btn-confirm'
    }
  }
}
