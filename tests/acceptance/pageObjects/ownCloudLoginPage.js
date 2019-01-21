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
  }
}
