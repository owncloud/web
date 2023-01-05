const util = require('util')
const { client } = require('nightwatch-api')

module.exports = {
  commands: {
    /**
     * sets up the xpath for year of expiry date
     *
     * @param {Date} date
     * @returns {{locateStrategy: string, selector: *}}
     */
    getSelectorExpiryDateYear: function (date) {
      const yearString = date.getFullYear()
      return {
        selector: util.format(this.elements.dateTimeYearPicker.selector, yearString),
        locateStrategy: this.elements.dateTimeYearPicker.locateStrategy
      }
    },
    /**
     * sets up the xpath for month of expiry date
     *
     * @param {Date} date
     * @returns {{locateStrategy: string, selector: *}}
     */
    getSelectorExpiryDateMonth: function (date) {
      const monthString = date.toLocaleString('en', { month: 'short' })
      return {
        selector: util.format(this.elements.dateTimeMonthPicker.selector, monthString),
        locateStrategy: this.elements.dateTimeMonthPicker.locateStrategy
      }
    },
    /**
     * sets up the xpath for year of expiry date
     *
     * @param {Date} date
     * @returns {{locateStrategy: string, selector: *}}
     */
    getSelectorExpiryDateDay: function (date) {
      const formatDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      const dayString = date.getDate()
      const fullDateString = date.toLocaleDateString('en', formatDate)
      return {
        selector: util.format(this.elements.dateTimeDayPicker.selector, dayString, fullDateString),
        locateStrategy: this.elements.dateTimeDayPicker.locateStrategy
      }
    },
    /**
     * sets provided year in expiry date field on webUI
     *
     * @param {Date} date
     * @returns {Promise<void>}
     */
    setExpiryDateYear: function (date) {
      const yearSelector = this.getSelectorExpiryDateYear(date)
      return this.waitForElementVisible('@datepickerTitle')
        .click('@datepickerTitle')
        .waitForElementVisible('@datepickerMonthAndYearTitle')
        .click('@datepickerMonthAndYearTitle')
        .waitForElementVisible(yearSelector)
        .click(yearSelector)
        .waitForElementVisible('@datepickerTitle')
        .click('@datepickerTitle')
        .waitForElementNotPresent('@datepickerMonthAndYearTitle')
    },
    /**
     * sets provided month in expiry date field on webUI
     *
     * @param {Date} date
     * @returns {Promise<void>}
     */
    setExpiryDateMonth: function (date) {
      const monthSelector = this.getSelectorExpiryDateMonth(date)
      return this.waitForElementVisible('@datepickerTitle')
        .click('@datepickerTitle')
        .waitForElementVisible('@datepickerMonthAndYearTitle')
        .waitForElementVisible(monthSelector)
        .click(monthSelector)
        .waitForElementNotPresent('@datepickerMonthAndYearTitle')
    },
    /**
     * sets provided day in expiry date field on webUI
     *
     * @param {Date} date
     * @returns {Promise<void>}
     */
    setExpiryDateDay: function (date) {
      const daySelector = this.getSelectorExpiryDateDay(date)
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
      const yearSelector = this.getSelectorExpiryDateYear(pastDate)
      const monthSelector = this.getSelectorExpiryDateMonth(pastDate)
      const daySelector = this.getSelectorExpiryDateDay(pastDate)

      await this.waitForElementVisible('@datepickerTitle')
        .click('@datepickerTitle')
        .waitForElementVisible('@datepickerMonthAndYearTitle')
        .click('@datepickerMonthAndYearTitle')
        .waitForElementVisible(yearSelector)
        .getAttribute(yearSelector, 'class', (result) => {
          if (result.value.includes('is-disabled') === true) {
            disabled = true
          }
        })

      if (disabled) {
        return disabled
      }

      await this.waitForElementVisible(yearSelector)
        .click(yearSelector)
        .waitForElementVisible(monthSelector)
        .getAttribute(monthSelector, 'class', (result) => {
          if (result.value.includes('is-disabled') === true) {
            disabled = true
          }
        })

      if (disabled) {
        return disabled
      }

      await this.waitForElementVisible(monthSelector)
        .click(monthSelector)
        .waitForElementVisible(daySelector)
        .getAttribute(daySelector, 'class', (result) => {
          if (result.value.includes('is-disabled') === true) {
            disabled = true
          }
        })

      return disabled
    },
    /**
     * a function to move the calendar to the given year
     *
     * WARN: this function is meant to be used as a script function for executeAsync() command
     * so it will only run in a browser context
     *
     * USAGE: client.executeAsync(moveCalendarYearScript, ['.calendar-id', '2040'])
     */
    moveCalendarYearScript: function (selector, dateRange, done) {
      return document
        .querySelector(selector)
        .__datePicker.$refs.calendar.move(new Date(Date.parse(dateRange)))

        .then(function () {
          done(true)
        })
        .catch(function (err) {
          done(err)
        })
    },
    /**
     * sets expiration date on collaborators/public-link shares
     *
     * @param {string} value - provided date in format YYYY-MM-DD, or empty string to unset date
     * @param {string} shareType link|collaborator
     * @returns {Promise<boolean>} returns true if succeeds to set provided expiration date
     */
    setExpirationDate: async function (
      value,
      shareType = 'collaborator',
      editCollaborator = false
    ) {
      if (value === '') {
        return this.click('@publicLinkDeleteExpirationDateButton')
      }
      const dateToSet = new Date(Date.parse(value))
      if (shareType === 'link') {
        await client.executeAsync(this.moveCalendarYearScript, [
          '.link-expiry-picker:not(.vc-container)',
          value
        ])
      } else if (editCollaborator) {
        await client.executeAsync(this.moveCalendarYearScript, [
          '.collaborator-edit-dropdown-options-list .files-recipient-expiration-datepicker',
          value
        ])
      } else {
        await client.executeAsync(this.moveCalendarYearScript, [
          '.files-recipient-expiration-datepicker',
          value
        ])
      }

      if (shareType === 'collaborator' || shareType === 'link') {
        const disabled = await this.isExpiryDateDisabled(dateToSet)
        if (disabled) {
          console.log('WARNING: Cannot change expiration date to disabled value!')
          await this.api.elements('@datePickerButton', ({ value }) => {
            for (const { ELEMENT } of value) {
              this.api.elementIdDisplayed(ELEMENT, (result) => {
                if (result.value === true) {
                  this.api.elementIdClick(ELEMENT)
                }
              })
            }
          })
          return false
        }
      }
      const month = dateToSet.toLocaleString('default', { month: 'long' })
      if (month === 'December') {
        await this.setExpiryDateMonth(dateToSet).setExpiryDateDay(dateToSet)
        return true
      }
      await this.setExpiryDateYear(dateToSet)
        .setExpiryDateMonth(dateToSet)
        .setExpiryDateDay(dateToSet)
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
        '//div[not(contains(@class, "is-not-in-month"))]/span[contains(@class, "vc-day-content vc-focusable") and normalize-space(.)="%s" and @aria-label="%s"]',
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
    },
    datePickerButton: {
      selector: 'button[data-testid="recipient-datepicker-btn"]'
    }
  }
}
