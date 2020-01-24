module.exports = {
  url: function () {
    return this.api.launchUrl
  },
  elements: {
    body: 'body',
    authorizeButton: {
      selector: 'button[type=submit]'
    }
  },
  commands: [
    {
      authorize: function () {
        return this
          .waitForElementVisible('@authorizeButton')
          .click('@authorizeButton')
          .waitForElementNotPresent({
            selector: '@authorizeButton',
            abortOnFailure: false
          }, (result) => {
            if (result.value.length > 0) {
              // click failed
              console.log('WARNING: looks like I\'m still on auth page. ' +
                'I will click the auth button again')
              this
                .click('@authorizeButton')
                .waitForElementNotPresent('@authorizeButton')
            }
          })
      }
    }
  ]
}
