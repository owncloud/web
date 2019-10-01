module.exports = {
  url: function () {
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
    }
  },
  commands: [
    {
      /**
       *
       * @param {string} username
       * @param {string} password
       */
      login: function (username, password) {
        return this
          .waitForElementVisible('@usernameInput')
          .setValue('@usernameInput', username)
          .setValue('@passwordInput', password)
          .click('@loginSubmitButton')
      }
    }
  ]
}
