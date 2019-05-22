module.exports = {
  commands: {
    /**
     *
     * @param {string} fileName
     */
    openSharingDialog: function (fileName) {
      const filesPage = this.api.page.filesPage()
      const shareBtnSelector = filesPage.getFileRowSelectorByFileName(fileName) +
        filesPage.elements['shareButtonInFileRow'].selector

      this.initAjaxCounters()
      filesPage.waitForFileVisible(fileName)
        .useXpath()
        .moveToElement(filesPage.getFileRowSelectorByFileName(fileName), 0, 0)
        .click(shareBtnSelector)

      return this.waitForElementVisible('@sharingSideBar')
        .useCss()
    },
    /**
     *
     * @param {string} sharee
     * @param {boolean} shareWithGroup
     */
    shareWithUserOrGroup: function (sharee, shareWithGroup = false) {
      this.enterAutoComplete(sharee)
        .waitForElementVisible('@sharingAutoCompleteDropDownElements')
      return this.api
        .initAjaxCounters()
        .elements('css selector', this.elements['sharingAutoCompleteDropDownElements'].selector, (result) => {
          result.value.forEach((value) => {
            this.api.elementIdText(value.ELEMENT, text => {
              if (shareWithGroup === true) sharee = `${sharee} (group)`
              if (text.value === sharee) {
                this.api
                  .elementIdClick(value.ELEMENT)
                  .waitForOutstandingAjaxCalls()
              }
            })
          })
        })
    },
    closeSharingDialog: function () {
      try {
        this.click('@sidebarCloseBtn')
      } catch (e) {
        // do nothing
      }
      return this
    },
    /**
     *
     * @param {string} input
     */
    enterAutoComplete: function (input) {
      return this.initAjaxCounters()
        .waitForElementVisible('@sharingAutoComplete')
        .setValue('@sharingAutoComplete', input)
    },
    getShareAutocompleteItemsList: function () {
      const itemsList = []
      const page = this
      return this
        .waitForElementVisible('@sharingAutoCompleteDropDownElements')
        .api.elements('css selector', this.elements['sharingAutoCompleteDropDownElements'].selector, (result) => {
          result.value.forEach(function (value) {
            page.api.elementIdText(value.ELEMENT, (text) => {
              itemsList.push(text.value)
            })
          })
        })
        .then(() => itemsList)
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
    },
    sharingSideBar: {
      selector: '#oc-files-sharing-sidebar'
    }
  }
}
