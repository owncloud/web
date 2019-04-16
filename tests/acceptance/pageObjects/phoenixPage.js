module.exports = {
  url: function () {
    return this.api.launchUrl + '/#/'
  },
  commands: {
    search: function (searchTerm) {
      return this.waitForElementVisible('@searchInputField')
        .initAjaxCounters()
        .setValue('@searchInputField', [searchTerm, this.api.Keys.ENTER])
        .waitForElementNotVisible('@searchLoadingIndicator')
        .waitForOutstandingAjaxCalls()
    }
  },
  elements: {
    message: {
      selector: '//*[contains(@class, "uk-notification-message-primary")]/div',
      locateStrategy: 'xpath'
    },
    searchInputField: {
      selector: '.oc-search-input'
    },
    searchLoadingIndicator: {
      selector: '.appTopbar .uk-spinner'
    }
  }
}
