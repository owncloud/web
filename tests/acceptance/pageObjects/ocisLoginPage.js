module.exports = {
  url: function () {
    return this.api.launchUrl
  },
  elements: {
    body: 'body',
    usernameInput: {
      selector: 'input[autocomplete="kopano-account username"]'
    },
    passwordInput: {
      selector: 'input[autocomplete="kopano-account current-password"]'
    },
    loginSubmitButton: {
      selector: 'button[type="submit"]'
    },
    invalidCredentialsMessage: {
      selector: '#oc-login-error-message'
    }
  },
  commands: [
    {
      /**
       *
       * @param {string} username
       * @param {string} password
       * @param expectToSucceed
       */
      login: async function (username, password, expectToSucceed = true) {
        await this.waitForElementVisible('@usernameInput')
          .clearValue('@usernameInput')
          .setValue('@usernameInput', username)
          .clearValue('@passwordInput')
          .setValue('@passwordInput', password)
          .click('@loginSubmitButton')

        if (expectToSucceed) {
          await this.waitForElementNotPresent('@usernameInput')
        } else {
          await this.waitForElementPresent('@usernameInput')
        }
        return this
      },
      getLoginErrorMessage: async function () {
        let errorMessage
        await this.api.assert.visible(this.elements.usernameInput.selector)
        await this.api.assert.visible(this.elements.passwordInput.selector)
        await this.api.assert.visible(this.elements.loginSubmitButton.selector)
        await this.useXpath()
          .waitForElementVisible('@invalidCredentialsMessage')
          .getText('@invalidCredentialsMessage', (result) => {
            errorMessage = result.value
          })
          .useCss()
        return errorMessage
      },
      waitForPage: function () {
        return this.waitForElementVisible('@loginSubmitButton')
      }
    }
  ]
}
