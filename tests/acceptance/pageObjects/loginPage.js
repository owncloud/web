const { join } = require('../helpers/path')

module.exports = {
  url: function () {
    return join(this.api.launchUrl, '/login')
  },
  elements: {
    body: 'body',
    authenticateButton: {
      selector: '//div/button/span[@class="MuiButton-label" and text()="Log in"]',
      locateStrategy: 'xpath'
    }
  },
  commands: [
    {
      authenticate: function () {
        return this.waitForElementVisible('@authenticateButton').click('@authenticateButton')
      },
      waitForPage: function () {
        return this.waitForElementVisible('@authenticateButton')
      }
    }
  ]
}
