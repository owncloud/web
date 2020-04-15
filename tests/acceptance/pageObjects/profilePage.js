module.exports = {
  commands: {
    getUserProfileName: async function() {
      let userInfo
      await this.waitForElementVisible('@profileInfoContainer')
        .waitForElementVisible('@userProfileName')
        .api.element('@userProfileName', result => {
          this.api.elementIdText(result.value.ELEMENT, text => {
            userInfo = text.value
          })
        })
      return userInfo
    },
    browseToManageAccount: function() {
      return this.waitForElementVisible('@manageAccount').click('@manageAccount')
    }
  },
  elements: {
    profileInfoContainer: {
      selector: '#account-info-container'
    },
    userProfileName: {
      selector: '//div/h3[@class="uk-card-title"]',
      locateStrategy: 'xpath'
    },
    manageAccount: {
      selector: '//div//span[.="Manage your account"]',
      locateStrategy: 'xpath'
    }
  }
}
