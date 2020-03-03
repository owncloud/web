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
    },
    /**
     * sets up the xpath for year in expiry date of public link
     *
     * @param day
     * @returns {{locateStrategy: string, selector: *}}
     */
    setExpiryDateDaySelectorXpath: function (day) {
      const daySelectorXpath = util.format(this.elements.dateTimeDayPicker.selector, day)
      return {
        selector: daySelectorXpath,
        locateStrategy: this.elements.dateTimeDayPicker.locateStrategy
      }
    },
    /**
     * sets provided year in expiry date field on webUI
     *
     * @param {string} year
     * @returns {Promise<void>}
     */
    setExpiryDateYear: function (year) {
      const yearSelector = this.setExpiryDateYearSelectorXpath(year)
      return this
        .waitForElementVisible('@dateTimePopupYear')
        .waitForAnimationToFinish()
        .waitForElementEnabled(
          this.elements.dateTimePopupYear.selector
        )
        .click('@dateTimePopupYear')
        .waitForElementVisible(yearSelector)
        .click(yearSelector)
        .click('@dateTimeOkButton')
        .waitForElementNotPresent(yearSelector)
    },
    /**
     * sets provided month in expiry date field on webUI
     *
     * @param {string} month
     * @returns {Promise<void>}
     */
    setExpiryDateMonth: function (month) {
      const monthSelector = this.setExpiryDateMonthSelectorXpath(month)
      return this
        .waitForElementVisible('@dateTimePopupDate')
        .click('@dateTimePopupDate')
        .waitForElementVisible(monthSelector)
        .click(monthSelector)
        .click('@dateTimeOkButton')
        .waitForElementNotPresent(monthSelector)
    },
    /**
     * sets provided day in expiry date field on webUI
     *
     * @param {string} day
     * @returns {Promise<void>}
     */
    setExpiryDateDay: function (day) {
      const daySelector = this.setExpiryDateDaySelectorXpath(day)
      return this
        .waitForElementVisible(daySelector)
        .click(daySelector)
        .click('@dateTimeOkButton')
        .waitForElementNotPresent(daySelector)
    },
    /**
     * checks if the given expiryDate is disabled or not
     *
     * @param {string} pastDate provided past date for inspection
     *  pastDate should be in form 2000-August-7 | 2000-Aug-7
     *  leading zeros before day are removed
     * @returns {Promise<boolean>}
     */
    isExpiryDateDisabled: async function (pastDate) {
      const [year, month, day] = pastDate.split(/-/)
      let disabled = false
      const iDay = parseInt(day)
      const yearSelector = this.setExpiryDateYearSelectorXpath(year)
      const monthSelector = this.setExpiryDateMonthSelectorXpath(month)
      const daySelector = this.setExpiryDateDaySelectorXpath(iDay)
      const linkExpirationDateField = this.api.page.FilesPageElement.publicLinksDialog().elements.linkExpirationDateField.selector
      await this
        .initAjaxCounters()
        .waitForElementVisible(linkExpirationDateField)
        .click(linkExpirationDateField)
        .waitForElementVisible('@dateTimePopupYear')
        .waitForAnimationToFinish()
        .waitForElementEnabled(
          this.elements.dateTimePopupYear.selector
        )
        .angryClick('@dateTimePopupYear')
        .waitForElementVisible(yearSelector)
        .getAttribute(yearSelector, 'class', (result) => {
          if (result.value.includes('--disabled') === true) {
            disabled = true
          }
        })
      if (disabled) { return disabled }
      await this
        .click(yearSelector)
        .click('@dateTimeOkButton')
        .waitForElementVisible('@dateTimePopupDate')
        .click('@dateTimePopupDate')
        .waitForElementVisible(monthSelector)
        .getAttribute(monthSelector, 'class', (result) => {
          if (result.value.includes('--disabled') === true) {
            disabled = true
          }
        })
      if (disabled) { return disabled }
      await this
        .click(monthSelector)
        .click('@dateTimeOkButton')
        .waitForElementVisible(daySelector)
        .getAttribute(daySelector, 'class', (result) => {
          if (result.value.includes('--disabled') === true) {
            disabled = true
          }
        })
      return disabled
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
    },
    dateTimeDayPicker: {
      selector: '//div[@class="vdatetime-calendar"]//span/span[normalize-space(.)="%s"]/../..',
      locateStrategy: 'xpath'
    },
    dateTimePopupYear: {
      selector: '.vdatetime-popup__year'
    },
    dateTimeOkButton: {
      selector: '//div[@class="vdatetime-popup__actions"]/div[.="Ok"]',
      locateStrategy: 'xpath'
    },
    dateTimePopupDate: {
      selector: '.vdatetime-popup__date'
    }
  }
}
