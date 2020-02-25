const util = require('util')

module.exports = {
  commands: {
    /**
     * sets up the xpath for year in expiry date of public link
     *
     * @param year
     * @returns {{locateStrategy: string, selector: *}}
     */
    setExpiryDateYearSelectorXpath: function (year) {
      const yearSelectorXpath = util.format(this.elements.dateTimeYearPicker.selector, year)
      return {
        selector: yearSelectorXpath,
        locateStrategy: this.elements.dateTimeYearPicker.locateStrategy
      }
    },
    /**
     * sets up the xpath for month in expiry date of public link
     *
     * @param month
     * @returns {{locateStrategy: string, selector: *}}
     */
    setExpiryDateMonthSelectorXpath: function (month) {
      const monthSelectorXpath = util.format(this.elements.dateTimeMonthPicker.selector, month)
      return {
        selector: monthSelectorXpath,
        locateStrategy: this.elements.dateTimeMonthPicker.locateStrategy
      }
    }
  },
  elements: {
    dateTimeYearPicker: {
      selector: '//div[@class="vdatetime-year-picker"]//div[normalize-space(.)="%s"]',
      locateStrategy: 'xpath'
    },
    dateTimeMonthPicker: {
      selector: '//div[@class="vdatetime-month-picker"]//div[contains(text(),"%s")]',
      locateStrategy: 'xpath'
    }
  }
}
