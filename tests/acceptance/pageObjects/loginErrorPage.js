const { join } = require('../helpers/path')

module.exports = {
  url: function () {
    return join(this.api.launchUrl, '/access-denied')
  },
  elements: {
    body: 'body',
    loginErrorMessage: {
      locateStrategy: 'xpath',
      selector: '//span[@data-msgid="Login Error"]'
    },
    exitButton: {
      selector: '#exitAnchor'
    }
  },
  commands: {
    waitTillLoaded: function () {
      const element = this.elements.loginErrorMessage
      return this.useStrategy(element).waitForElementVisible(element)
    },
    exit: function () {
      const exitBtn = this.elements.exitButton
      return this.waitForElementVisible(exitBtn).click(exitBtn)
    }
  }
}
