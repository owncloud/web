module.exports = {
  commands: {
    getUserProfileAvatar: async function () {
      let userInfo
      await this.waitForElementVisible('@userProfileAvatar').api.element(
        '@userProfileAvatar',
        (result) => {
          this.api.elementIdText(result.value.ELEMENT, (text) => {
            userInfo = text.value
          })
        }
      )
      return userInfo
    },
    browseToManageAccount: function () {
      return this.waitForElementVisible('@manageAccount').click('@manageAccount')
    }
  },
  elements: {
    userProfileAvatar: {
      selector: '.oc-topbar-personal-avatar'
    },
    manageAccount: {
      selector: '#oc-topbar-account-manage'
    }
  }
}
