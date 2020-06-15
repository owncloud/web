module.exports = {
  commands: {
    getUserProfileName: async function() {
      let userInfo
      await this.waitForElementVisible('@userProfileName').api.element(
        '@userProfileName',
        result => {
          this.api.elementIdText(result.value.ELEMENT, text => {
            userInfo = text.value
          })
        }
      )
      return userInfo
    },
    browseToManageAccount: function() {
      return this.waitForElementVisible('@manageAccount').click('@manageAccount')
    }
  },
  elements: {
    userProfileName: {
      selector: '.oc-topbar-personal-label'
    },
    manageAccount: {
      selector: '#oc-topbar-account-manage'
    }
  }
}
