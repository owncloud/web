const { join } = require('../helpers/path')

module.exports = {
  url: function() {
    return join(this.api.launchUrl, '/#/login')
  },
  elements: {
    body: 'body',
    authenticateButton: {
      selector: '#authenticate'
    }
  },
  commands: [
    {
      authenticate: function() {
        return this.waitForElementVisible('@authenticateButton').click('@authenticateButton')
      }
    }
  ]
}
