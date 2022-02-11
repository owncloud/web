module.exports = {
  commands: [
    {
      /**
       * Wait for the password input section of public link page to appear
       */
      waitForVisible: async function () {
        await this.waitForElementVisible('@publicLinkPasswordSection')
      },
      /**
       *
       * @param {string} password
       */
      submitPublicLinkPassword: async function (password) {
        await this.waitForElementVisible('@passwordInput')
          .setValue('@passwordInput', password)
          .click('@passwordSubmitButton')

        return this.page.FilesPageElement.filesList().waitForLoadingFinished(false, false)
      },
      /**
       * submits the public link password input form
       * this is made for those scenarios where we submit wrong password in previous steps and webUI doesn't navigate to files-page
       */
      submitLinkPasswordForm: function () {
        return this.waitForElementVisible('@passwordInput')
          .initAjaxCounters()
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
        await this.waitForElementVisible('@passwordSubmitButton').getText(
          '@resourceProtectedText',
          (result) => {
            message = result.value
          }
        )
        return message
      }
    }
  ],
  elements: {
    body: 'body',
    passwordInput: {
      selector: 'input[type=password]'
    },
    passwordSubmitButton: {
      selector: '.oc-login-authorize-button'
    },
    resourceProtectedText: {
      selector: '//*[@class="oc-card-header"]',
      locateStrategy: 'xpath'
    },
    linkResolveErrorTitle: {
      selector: '.oc-link-resolve-error-title'
    },
    publicLinkPasswordSection: {
      selector: '//*[@class="oc-card-header"]//*[text()="This resource is password-protected"]',
      locateStrategy: 'xpath'
    }
  }
}
