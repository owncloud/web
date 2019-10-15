module.exports = {
  url: function () {
    return this.api.launchUrl
  },
  elements: {
    body: 'body',
    passwordInput: {
      selector: 'input[type=password]'
    },
    passwordSubmitButton: {
      selector: '.oc-login-authorize-button'
    }
  },
  commands: [
    {
      /**
       *
       * @param {string} password
       */
      submitPublicLinkPassword: async function (password) {
        await this
          .waitForElementVisible('@passwordInput')
          .setValue('@passwordInput', password)
          .click('@passwordSubmitButton')

        return this
          .page.FilesPageElement.filesList()
          .waitForElementPresent({ selector: '@filesListProgressBar', abortOnFailure: false }) // don't fail if we are too late
          .waitForElementNotPresent('@filesListProgressBar')
      }
    }
  ]
}
