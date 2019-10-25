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
    },
    resourceProtectedText: {
      selector: '//h2[@class="oc-login-card-title"]/span',
      locateStrategy: 'xpath'
    },
    loadingPublicLink: {
      selector: "//div[@class='oc-login-card uk-position-center']//span[.='Loading public link…']",
      locateStrategy: 'xpath'
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
      },
      assertResourceAccessDenied: function () {
        return this
          .waitForElementPresent('@passwordSubmitButton')
          .click('@passwordSubmitButton')
          .waitForElementVisible('@loadingPublicLink')
          .waitForElementPresent('@passwordInput')
          .getText(
            this.elements.resourceProtectedText.locateStrategy,
            this.elements.resourceProtectedText.selector,
            (result) => {
              if (result.value !== 'This resource is password-protected.') {
                throw new Error('Resource Protected Message Invalid', result)
              }
            }
          )
      }
    }
  ]
}
