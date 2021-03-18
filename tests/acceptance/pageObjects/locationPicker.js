const { client } = require('nightwatch-api')

module.exports = {
  commands: {
    selectFolderAndConfirm: async function(target) {
      await this.selectFolder(target)
      return this.waitForElementVisible('@confirmBtn').click('@confirmBtn')
    },
    selectFolder: async function(target) {
      const targetSplitted = target.split('/')
      for (let i = 0; i < targetSplitted.length; i++) {
        await client.page.FilesPageElement.filesList().navigateToFolder(targetSplitted[i])
      }
      return this
    },
    copyOrMoveNotAllowed: async function() {
      return await this.waitForElementVisible('@confirmBtnDisabled')
    }
  },
  elements: {
    confirmBtn: {
      selector: 'button#location-picker-btn-confirm'
    },
    confirmBtnDisabled: {
      selector: '//button[@id="location-picker-btn-confirm" and @disabled="disabled"]',
      locateStrategy: 'xpath'
    }
  }
}
