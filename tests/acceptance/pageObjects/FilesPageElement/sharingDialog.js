const groupSharePostfix = ' (group)'

module.exports = {
  commands: {
    /**
     *
     * @param {string} sharee
     * @param {boolean} shareWithGroup
     */
    shareWithUserOrGroup: async function (sharee, shareWithGroup = false) {
      this.enterAutoComplete(sharee.slice(0, -1))
        .pause(500)
        .enterAutoComplete(sharee.slice(-1))
      // We need waitForElementPresent here.
      // waitForElementVisible would break even with 'abortOnFailure: false' if the element is not present
        .waitForElementPresent({
          selector: '@sharingAutoCompleteDropDownElements',
          abortOnFailure: false
        }, (result) => {
          if (result.value === false) {
            // sharing dropdown was not shown
            console.log('WARNING: no sharing autocomple dropdown found, retry typing')
            this.clearValue('@sharingAutoComplete')
              .enterAutoComplete(sharee.slice(0, -1))
              .waitForElementVisible('@sharingAutoCompleteDropDownElements')
          }
        })

      const webElementIdList = await this.getShareAutocompleteWebElementIdList()
      webElementIdList.forEach((webElementId) => {
        this.api.elementIdText(webElementId, (text) => {
          if (shareWithGroup === true) {
            sharee = sharee + groupSharePostfix
          }
          if (text.value === sharee) {
            this.api
              .elementIdClick(webElementId)
              .waitForOutstandingAjaxCalls()
          }
        })
      })
      return this
    },
    closeSharingDialog: function () {
      try {
        this.click('@sidebarCloseBtn')
      } catch (e) {
        // do nothing
      }
      return this.api.page.FilesPageElement.filesList()
    },
    /**
     *
     * @param {string} input
     */
    enterAutoComplete: function (input) {
      return this.initAjaxCounters()
        .waitForElementVisible('@sharingAutoComplete')
        .setValue('@sharingAutoComplete', input)
        .waitForOutstandingAjaxCalls()
    },
    /**
     *
     * @returns {Promise.<string[]>} Array of autocomplete items
     */
    getShareAutocompleteItemsList: async function () {
      const webElementIdList = await this.getShareAutocompleteWebElementIdList()
      let itemsListPromises = webElementIdList.map((webElementId) => {
        return new Promise((resolve, reject) => {
          this.api.elementIdText(webElementId, (text) => {
            resolve(text.value)
          })
        })
      })

      return Promise.all(itemsListPromises)
    },
    /**
     *
     * @returns {Promise.<string[]>} Array of autocomplete webElementIds
     */
    getShareAutocompleteWebElementIdList: function () {
      const webElementIdList = []
      return this
        .waitForElementVisible('@sharingAutoCompleteDropDownElements')
        .api.elements('css selector', this.elements['sharingAutoCompleteDropDownElements'].selector, (result) => {
          result.value.forEach((value) => {
            webElementIdList.push(value.ELEMENT)
          })
        })
        .then(() => webElementIdList)
    }
  },
  elements: {
    sharingAutoComplete: {
      selector: '#oc-sharing-autocomplete .oc-autocomplete-input'
    },
    sharingAutoCompleteDropDown: {
      selector: '#oc-sharing-autocomplete .oc-autocomplete-suggestion-list'
    },
    sharingAutoCompleteDropDownElements: {
      selector: '#oc-sharing-autocomplete .oc-autocomplete-suggestion'
    },
    sidebarCloseBtn: {
      selector: '//div[@class="sidebar-container"]//div[@class="action"]//button',
      locateStrategy: 'xpath'
    }
  }
}
