const util = require('util')
const { client } = require('nightwatch-api')

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
      return this.click('@datepickerTitle')
        .waitForElementVisible('@datepickerMonthAndYearTitle', 500)
        .click('@datepickerMonthAndYearTitle')
        .waitForElementVisible(yearSelector, 500)
        .click(yearSelector)
        .click('@datepickerTitle')
        .waitForElementNotPresent('@datepickerMonthAndYearTitle', 500)
    },
    /**
     * sets provided month in expiry date field on webUI
     *
     * @param {number} month
     * @returns {Promise<void>}
     */
    setExpiryDateMonth: function (month) {
      const monthSelector = this.setExpiryDateMonthSelectorXpath(month)
      return this.click('@datepickerTitle')
        .waitForElementVisible('@datepickerMonthAndYearTitle', 500)
        .waitForElementVisible(monthSelector)
        .click(monthSelector)
        .waitForElementNotPresent('@datepickerMonthAndYearTitle', 500)
    },
    /**
     * sets provided day in expiry date field on webUI
     *
     * @param {string} day
     * @returns {Promise<void>}
     */
    setExpiryDateDay: function (day) {
      const daySelector = this.setExpiryDateDaySelectorXpath(day)
      return this.waitForElementVisible(daySelector)
        .click(daySelector)
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

      await this.click('@datepickerTitle')
        .waitForElementVisible('@datepickerMonthAndYearTitle', 500)
        .click('@datepickerMonthAndYearTitle')
        .waitForElementVisible(yearSelector, 500)
        .getAttribute(yearSelector, 'class', (result) => {
          if (result.value.includes('is-disabled') === true) {
            disabled = true
          }
        })

      if (disabled) {
        return disabled
      }

      const monthSelector = this.setExpiryDateMonthSelectorXpath(
        pastDate.toLocaleString('en', { month: 'short' })
      )

      await this.click(yearSelector)
        .waitForElementVisible(monthSelector)
        .getAttribute(monthSelector, 'class', (result) => {
          if (result.value.includes('is-disabled') === true) {
            disabled = true
          }
        })

      if (disabled) {
        return disabled
      }

      const daySelector = this.setExpiryDateDaySelectorXpath(pastDate.getDate())

      await this.click(monthSelector)
        .waitForElementVisible(daySelector)
        .getAttribute(daySelector, 'class', (result) => {
          if (result.value.includes('is-disabled') === true) {
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
          await this.click(
            client.page.FilesPageElement.sharingDialog().elements.expirationDateField.selector
          )
          return false
        }
      }
      const year = dateToSet.getFullYear()
      const month = dateToSet.toLocaleString('en', { month: 'short' })
      const day = dateToSet.getDate()
      await this.setExpiryDateYear(year).setExpiryDateMonth(month).setExpiryDateDay(day)
      return true
    }
  },
  elements: {
    dateTimeYearPicker: {
      selector:
        '//span[contains(@class, "vc-nav-item") and @role="button" and normalize-space(.)="%s"]',
      locateStrategy: 'xpath'
    },
    dateTimeMonthPicker: {
      selector:
        '//span[contains(@class, "vc-nav-item") and @role="button" and normalize-space(.)="%s"]',
      locateStrategy: 'xpath'
    },
    dateTimeDayPicker: {
      selector:
        '//div[not(contains(@class, "is-not-in-month"))]/span[contains(@class, "vc-day-content vc-focusable") and normalize-space(.)="%s"]',
      locateStrategy: 'xpath'
    },
    publicLinkDeleteExpirationDateButton: {
      selector: '#oc-files-file-link-expire-date-delete'
    },
    datepickerTitle: {
      selector: '.vc-title'
    },
    datepickerMonthAndYearTitle: {
      selector: '.vc-nav-title.vc-grid-focus'
    }
  }
}
