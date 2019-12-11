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
      /**
       * submits the public link password input form
       * this is made for those scenarios where we submit wrong password in previous steps and webUI doesn't navigate to files-page
       */
      submitLinkPasswordForm: function () {
        return this
          .initAjaxCounters()
          .waitForElementVisible('@passwordInput')
          .click('@passwordSubmitButton')
          .waitForOutstandingAjaxCalls()
      },
      /**
       * gets resource access denied message after clicking submit password button for a public link share
       *
       * @return {Promise<string>}
       */
      getResourceAccessDeniedMsg: async function () {
        let message
        await this
          .waitForElementVisible('@passwordSubmitButton')
          .getText(
            '@resourceProtectedText',
            (result) => {
              message = result.value
            }
          )
        return message
      }
    }
  ]
}
