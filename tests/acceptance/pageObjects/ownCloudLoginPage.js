module.exports = {
  url: function() {
    return this.api.launchUrl
  },
  elements: {
    body: 'body',
    usernameInput: {
      selector: '#user'
    },
    passwordInput: {
      selector: '#password'
    },
    loginSubmitButton: {
      selector: '#submit'
    },
    invalidCredentialsMessage: {
      selector: '#lost-password'
    }
  },
  commands: [
    {
      /**
       *
       * @param {string} username
       * @param {string} password
       * @param expectedToSucceed
       */
      login: async function(username, password, expectedToSucceed = true) {
        await this.waitForElementVisible('@usernameInput')
          .clearValue('@usernameInput')
          .setValue('@usernameInput', username)
          .clearValue('@passwordInput')
          .setValue('@passwordInput', password)
          .click('@loginSubmitButton')
        if (expectedToSucceed) {
          await this.waitForElementNotPresent('@usernameInput')
        } else {
          await this.waitForElementPresent('@usernameInput')
        }
        return this
      },
      getLoginErrorMessage: async function() {
        let errorMessage
        await this.api.assert.visible(this.elements.usernameInput.selector)
        await this.api.assert.visible(this.elements.passwordInput.selector)
        await this.api.assert.visible(this.elements.loginSubmitButton.selector)
        await this.waitForElementVisible('@invalidCredentialsMessage').getText(
          '@invalidCredentialsMessage',
          result => {
            errorMessage = result.value
          }
        )
        return errorMessage
      },
      waitTillLoaded: async function() {
        await this.waitForElementVisible(this.elements.usernameInput.selector)
        await this.waitForElementVisible(this.elements.passwordInput.selector)
        await this.waitForElementVisible(this.elements.loginSubmitButton.selector)
      }
    }
  ]
}
