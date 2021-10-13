module.exports = {
  commands: {
    waitTillLoaded: function () {
      const element = this.elements.userDisabledMessage
      return this.useStrategy(element).waitForElementVisible(element)
    }
  },
  elements: {
    userDisabledMessage: {
      locateStrategy: 'xpath',
      selector: '//li[normalize-space()="User disabled"]'
    }
  }
}
