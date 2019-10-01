module.exports = {
  url: function () {
    return this.api.launchUrl + '/#/login'
  },
  elements: {
    body: 'body',
    authenticateButton: {
      selector: '#authenticate'
    }
  },
  commands: [
    {
      authenticate: function () {
        return this.waitForElementVisible('@authenticateButton')
          .click('@authenticateButton')
      }
    }
  ]
}
