module.exports = {
  commands: {
    /**
     * @returns {Promise<number>}
     */
    getVersionsCount: async function () {
      let count = 0
      await this.api.elements('@versionsList', function (result) {
        count = result.value.length
      })
      return count
    },
    /**
     * @returns {*}
     */
    restoreToPreviousVersion: function () {
      return this.waitForElementVisible('@restorePreviousVersion')
        .initAjaxCounters()
        .click('@restorePreviousVersion')
        .waitForOutstandingAjaxCalls()
    }
  },
  elements: {
    versionsList: {
      selector: '//div[@id="oc-file-versions-sidebar"]//li[contains(@class,"version-item")]',
      locateStrategy: 'xpath'
    },
    restorePreviousVersion: {
      selector:
        '(//div[contains(@id,"oc-file-versions")]//li[contains(@class,"version-item")])[1]//button[1]',
      locateStrategy: 'xpath'
    }
  }
}
