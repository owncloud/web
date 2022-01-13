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
    }
  },
  elements: {
    batchActionButton: {
      selector:
        '//div[@class="files-app-bar-actions"]//button/descendant-or-self::*[contains(text(),"%s")]',
      locateStrategy: 'xpath'
    }
  }
}
