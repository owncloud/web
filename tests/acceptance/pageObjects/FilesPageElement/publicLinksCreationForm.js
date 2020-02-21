const util = require('util')
const sharingHelper = require('../../helpers/sharingHelper')

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
     * sets expire date of the public link share using webUI
     *
     * @param {string} value - provided date in format YYYY-MM-DD, or empty string to unset date
     * @returns {Promise}
     */
    setPublicLinkExpiryDate: function (value) {
      if (value === '') {
        return this.click('@publicLinkDeleteExpirationDateButton')
      }
      value = sharingHelper.calculateDate(value)
      const dateToSet = new Date(Date.parse(value))
      const year = dateToSet.getFullYear()
      const month = dateToSet.toLocaleString('en-GB', { month: 'long' })
      const day = dateToSet.getDate()

      return this
        .initAjaxCounters()
        .waitForElementVisible('@linkExpirationDateField')
        .click('@linkExpirationDateField')
        .setExpiryDateYear(year)
        .setExpiryDateMonth(month)
        .setExpiryDateDay(day)
    }
  },
  elements: {
    publicLinkDeleteExpirationDateButton: {
      selector: '#oc-files-file-link-expire-date-delete'
    },
    linkExpirationDateField: {
      selector: '.vdatetime-input'
    },
    dateTimePopup: {
      selector: '.vdatetime-popup'
    },
    dateTimePopupYear: {
      selector: '.vdatetime-popup__year'
    },
    dateTimePopupDate: {
      selector: '.vdatetime-popup__date'
    },
    dateTimeMonthPicker: {
      selector: '//div[@class="vdatetime-month-picker"]//div[contains(text(),"%s")]',
      locateStrategy: 'xpath'
    },
    dateTimeYearPicker: {
      selector: '//div[@class="vdatetime-year-picker"]//div[normalize-space(.)="%s"]',
      locateStrategy: 'xpath'
    },
    dateTimeDayPicker: {
      selector: '//div[@class="vdatetime-calendar"]//span/span[normalize-space(.)="%s"]/../..',
      locateStrategy: 'xpath'
    },
    dateTimeOkButton: {
      selector: '//div[@class="vdatetime-popup__actions"]/div[.="Ok"]',
      locateStrategy: 'xpath'
    },
    dateTimeCancelButton: {
      selector: '//div[@class="vdatetime-popup__actions"]/div[.="Cancel"]',
      locateStrategy: 'xpath'
    }
  }
}
