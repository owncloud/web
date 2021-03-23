const { client } = require('nightwatch-api')

module.exports = {
  commands: {
    selectFolderAndConfirm: async function(target) {
      await this.selectFolder(target)
      return this.waitForElementVisible('@confirmBtn').click('@confirmBtn')
    },
    selectFolder: async function(target) {
      if (target.startsWith('/')) {
        // if the target is absolute, we need to go to the root element first
        let firstBreadcrumbLink = null
        await this.api.elements('xpath', this.elements.breadcrumbLinks, result => {
          if (result.value && result.value.length > 0) {
            firstBreadcrumbLink = result.value[0].ELEMENT
          }
        })
        if (firstBreadcrumbLink !== null) {
          await this.api.elementIdClick(firstBreadcrumbLink)
        }
      }
      const targetSplitted = target.replace(/^(\/|\\)+/, '').split('/')
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
    breadcrumbLinks: {
      selector: '//ul[contains(@class, "oc-breadcrumb-list")]/li/a',
      locateStrategy: 'xpath'
    },
    confirmBtn: {
      selector: 'button#location-picker-btn-confirm'
    },
    confirmBtnDisabled: {
      selector: '//button[@id="location-picker-btn-confirm" and @disabled="disabled"]',
      locateStrategy: 'xpath'
    }
  }
}
