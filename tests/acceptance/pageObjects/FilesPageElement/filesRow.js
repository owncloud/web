/* eslint-disable no-unused-expressions */
const util = require('util')

module.exports = {
  commands: {
    isQuickActionVisible: function (action) {
      const className = action === 'collaborators' ? 'show-shares' : 'copy-quicklink'
      const actionSelector = util.format(this.elements.quickAction.selector, className)

      this.useXpath().expect.element(actionSelector).to.be.visible
      this.useCss()

      return this
    }
  },
  elements: {
    quickAction: {
      selector: '//button[contains(@class, "files-quick-action-%s")]',
      locateStrategy: 'xpath'
    }
  }
}
