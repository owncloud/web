const util = require('util')
module.exports = {
  commands: {
    isBatchActionButtonVisible: async function (batchButtonName, expectedVisible = true) {
      let result = false
      const batchActionButtonEl = {
        selector: this.getBatchActionButtonElementSelector(batchButtonName),
        locateStrategy: 'xpath'
      }
      await this.isVisible(
        {
          ...batchActionButtonEl,
          suppressNotFoundErrors: !expectedVisible
        },
        (res) => {
          if (res.status === 0 && res.value === true) {
            result = res.value
          }
        }
      )
      return result
    },
    getBatchActionButtonElementSelector: function (batchButtonName) {
      return util.format(this.elements.batchActionButton.selector, batchButtonName)
    },
    navigateToSharesSubPage: async function (sharesSubPageButtonName) {
      const sharesSubPageBtn = {
        selector: util.format(this.elements.sharesSubPageButton.selector, sharesSubPageButtonName),
        locateStrategy: 'xpath'
      }
      return this.waitForElementVisible(sharesSubPageBtn).click(sharesSubPageBtn)
    }
  },
  elements: {
    batchActionButton: {
      selector:
        '//div[@class="files-app-bar-actions"]//button/descendant-or-self::*[contains(text(),"%s")]',
      locateStrategy: 'xpath'
    },
    sharesSubPageButton: {
      selector: '//nav[@id="shares-navigation"]//*[.="%s"]',
      locateStrategy: 'xpath'
    }
  }
}
