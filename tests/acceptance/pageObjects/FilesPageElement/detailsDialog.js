module.exports = {
  commands: {
    getSharedViaPath: async function () {
      const sharedViaXpath =
        this.elements.detailsTable.selector + this.elements.dataCellSharedVia.selector
      let text = ''
      await this.useXpath()
        .waitForElementVisible(sharedViaXpath)
        .getText('xpath', sharedViaXpath, function (result) {
          if (typeof result.value === 'string') {
            text = result.value
          }
        })
      console.log(text)
      return text
    }
  },
  elements: {
    detailsTable: {
      selector: '//*[@id="oc-file-details-sidebar"]//table[contains(@class, "details-table")]',
      locateStrategy: 'xpath'
    },
    dataCellSharedVia: {
      // inside detailsTable
      selector: '//tr[@data-testid="shared-via"]/td',
      locateStrategy: 'xpath'
    }
  }
}
