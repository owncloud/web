module.exports = {
  url: function() {
    return this.api.launchUrl
  },
  elements: {
    body: {
      selector: '#body-login'
    },
    authorizeButton: {
      selector: 'button[type=submit]'
    },
    inputUsername: {
      selector: '//input[@id="user"]',
      locateStrategy: 'xpath'
    }
  },
  commands: [
    {
      authorize: function() {
        return this.waitForElementVisible('@authorizeButton')
          .click('@authorizeButton')
          .waitForElementNotPresent(
            {
              selector: '@authorizeButton',
              abortOnFailure: false
            },
            result => {
              if (result.value.length > 0) {
                // click failed
                console.log(
                  "WARNING: looks like I'm still on auth page. " +
                    'I will click the auth button again'
                )
                this.click('@authorizeButton').waitForElementNotPresent('@authorizeButton')
              }
            }
          )
      },
      waitForPage: async function() {
        let isLoginPageVisible = false

        await this.waitForElementVisible('@body')
        await this.api.element('@inputUsername', result => {
          if (result.status > -1) {
            isLoginPageVisible = true
          }
        })

        if (isLoginPageVisible) {
          return this.assert.ok(isLoginPageVisible)
        }

        return this.api.expect.element(this.elements.authorizeButton.selector).to.be.visible
      }
    }
  ]
}
