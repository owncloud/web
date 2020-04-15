module.exports = {
  commands: {
    /**
     * @returns {Promise<number>}
     */
    getVersionsCount: async function() {
      let count = 0
      await this.api.elements('@versionsList', function(result) {
        count = result.value.length
      })
      return count
    },
    /**
     * @returns {*}
     */
    restoreToPreviousVersion: function() {
      return this.initAjaxCounters()
        .waitForElementVisible('@restorePreviousVersion')
        .click('@restorePreviousVersion')
        .waitForOutstandingAjaxCalls()
    }
  },
  elements: {
    versionsList: {
      selector: '//div[@id="oc-file-versions-sidebar"]//tr[@class="file-row"]',
      locateStrategy: 'xpath'
    },
    restorePreviousVersion: {
      selector:
        '(//div[contains(@id,"oc-file-versions")]//tbody/tr[@class="file-row"])[1]//button[1]',
      locateStrategy: 'xpath'
    }
  }
}
