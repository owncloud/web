const util = require('util')

module.exports = {
  commands: {
    /**
     * sets up the xpath for year of expiry date
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
     * sets up the xpath for month of expiry date
     *
     * @param {string} month month name
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
     * sets up the xpath for year of expiry date
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
     * @param {number} month
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
     * @param {Date} pastDate provided past date for inspection
     *
     * @returns {Promise<boolean>}
     */
    isExpiryDateDisabled: async function (pastDate) {
      let disabled = false
      const yearSelector = this.setExpiryDateYearSelectorXpath(pastDate.getFullYear())
      const monthSelector = this.setExpiryDateMonthSelectorXpath(
        pastDate.toLocaleString('en-GB', { month: 'long' })
      )
      const daySelector = this.setExpiryDateDaySelectorXpath(pastDate.getDate())
      await this
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
    },
    /**
     * sets expiration date on collaborators/public-link shares
     *
     * @param {string} value - provided date in format YYYY-MM-DD, or empty string to unset date
     * @param {string} shareType link|collaborator
     * @returns {Promise<boolean>} returns true if succeeds to set provided expiration date
     */
    setExpirationDate: async function (value, shareType = 'collaborator') {
      if (value === '') {
        return this.click('@publicLinkDeleteExpirationDateButton')
      }
      const dateToSet = new Date(Date.parse(value))
      if (shareType === 'collaborator' || shareType === 'link') {
        const disabled = await this.isExpiryDateDisabled(dateToSet)
        if (disabled) {
          console.log('WARNING: Cannot change expiration date to disabled value!')
          await this
            .waitForElementVisible('@dateTimeCancelButton')
            .click('@dateTimeCancelButton')
          return false
        }
      }
      const year = dateToSet.getFullYear()
      const month = dateToSet.toLocaleString('en-GB', { month: 'long' })
      const day = dateToSet.getDate()
      await this
        .setExpiryDateYear(year)
        .setExpiryDateMonth(month)
        .setExpiryDateDay(day)
      return true
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
    dateTimeCancelButton: {
      selector: '//div[@class="vdatetime-popup__actions"]/div[.="Cancel"]',
      locateStrategy: 'xpath'
    },
    dateTimePopupDate: {
      selector: '.vdatetime-popup__date'
    },
    publicLinkDeleteExpirationDateButton: {
      selector: '#oc-files-file-link-expire-date-delete'
    }
  }
}
