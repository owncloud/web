const util = require('util')
const _ = require('lodash')
const sharingHelper = require('../../helpers/sharingHelper')

module.exports = {
  commands: {
    /**
     * clicks the edit button of public link
     *
     * @param linkName Name of the public link
     * @returns {Promise<void>}
     */
    clickLinkEditBtn: function (linkName) {
      const linkRowEditButtonSelector = util.format(this.elements.publicLinkEditButton.selector, linkName)
      const linkRowEditButton = {
        locateStrategy: this.elements.publicLinkEditButton.locateStrategy,
        selector: linkRowEditButtonSelector
      }
      return this
        .initAjaxCounters()
        .waitForElementVisible(linkRowEditButton)
        .click(linkRowEditButton)
        .waitForOutstandingAjaxCalls()
    },
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
     * sets role or permissions for public link on webUI
     *
     * @param {string} role - e.g. Viewer, Contributor, Editor, Uploader
     * @returns {Promise<void>}
     */
    setPublicLinkRole: function (role) {
      role = _(role).chain().toLower().startCase().replace(/\s/g, '').value()
      return this.waitForElementPresent('@selectRoleButton')
        .click('@selectRoleButton')
        .waitForElementVisible('@rolesDropdown')
        .waitForElementVisible(`@role${role}`)
        .click(`@role${role}`)
        .waitForElementNotVisible('@rolesDropdown')
    },
    /**
     * sets name of the public link share on webUI
     *
     * @param {string} linkName Name of the public link share
     *
     */
    setPublicLinkName: function (linkName) {
      return this
        .waitForElementVisible('@publicLinkNameInputField')
        .clearValue('@publicLinkNameInputField')
        .setValue('@publicLinkNameInputField', linkName)
    },
    /**
     * sets password of the public link share
     *
     * @param {string} linkPassword
     * @returns {Promise<void>}
     */
    setPublicLinkPassword: function (linkPassword) {
      this.waitForElementVisible('@publicLinkPasswordField')
      if (linkPassword === '') {
        return this.click('@publicLinkDeletePasswordButton')
      }
      return this
        .clearValue('@publicLinkPasswordField')
        .setValue('@publicLinkPasswordField', linkPassword)
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
    },
    /**
     * function sets different fields for public link
     *
     * @param key fields like name, password, expireDate, role
     * @param value values for the different fields to be set
     * @returns {*|Promise<void>|exports}
     */
    setPublicLinkForm: function (key, value) {
      if (key === 'role') {
        return this.setPublicLinkRole(value)
      } else if (key === 'name') {
        return this.setPublicLinkName(value)
      } else if (key === 'password') {
        return this.setPublicLinkPassword(value)
      } else if (key === 'expireDate') {
        return this.setPublicLinkExpiryDate(value)
      }
      return this
    },
    /**
     * checks if the given expiryDate is disabled or not
     *
     * @param {string} linkName name of the public link
     * @param {string} pastDate provided past date for inspection
     *  pastDate should be in form 2000-August-7 | 2000-Aug-7
     *  leading zeros before day are removed
     * @returns {Promise<boolean>}
     */
    isExpiryDateDisabled: async function (linkName, pastDate) {
      await this.clickLinkEditBtn(linkName)
      const [year, month, day] = pastDate.split(/-/)
      let disabled = false
      const iDay = parseInt(day)
      const yearSelector = this.setExpiryDateYearSelectorXpath(year)
      const monthSelector = this.setExpiryDateMonthSelectorXpath(month)
      const daySelector = this.setExpiryDateDaySelectorXpath(iDay)
      await this
        .initAjaxCounters()
        .waitForElementVisible('@linkExpirationDateField')
        .click('@linkExpirationDateField')
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
     * sets up public link share edit form
     *
     * @param {string} linkName
     * @param {object} editData -  key: value pair of public link edit data
     * @param {string} editData.role - Role of the viewer of the public link
     * @param {string} editData.name - Name of the public link share
     * @param {string} editData.password - Password for a public link share
     * @param {string} editData.expireDate - Expire date for a public link share
     * @returns {exports}
     */
    editPublicLink: function (linkName, editData) {
      this.clickLinkEditBtn(linkName)
      for (const [key, value] of Object.entries(editData)) {
        this.setPublicLinkForm(key, value)
      }
      return this
    },
    /**
     * clicks save button of public link form
     *
     * @returns {exports}
     */
    savePublicLink: function () {
      return this
        .initAjaxCounters()
        .waitForElementVisible('@publicLinkSaveButton')
        .click('@publicLinkSaveButton')
        .waitForElementNotPresent({ selector: '@publicLinkSaveButton', abortOnFailure: false })
        .waitForOutstandingAjaxCalls()
    },
    /**
     * deletes existing public link share
     *
     * @param {string} linkName Name of the public link share of a resource to be deleted
     * @returns {exports}
     */
    removePublicLink: function (linkName) {
      const linkRowDeleteButtonSelector = util.format(this.elements.publicLinkDeleteButton.selector, linkName)
      const linkRowDeleteButton = {
        locateStrategy: this.elements.publicLinkDeleteButton.locateStrategy,
        selector: linkRowDeleteButtonSelector
      }
      return this
        .initAjaxCounters()
        .waitForElementVisible(linkRowDeleteButton)
        .click(linkRowDeleteButton)
        .waitForOutstandingAjaxCalls()
    },
    /**
     * checks if public link share with given name is present
     *
     * @param {string} linkName - Name of the public link share to be asserted
     * @returns {boolean}
     */
    isPublicLinkPresent: async function (linkName) {
      const fileNameSelectorXpath = this.elements.publicLinkContainer.selector + this.elements.publicLinkName.selector
      let isPresent
      await this
        .waitForAnimationToFinish()
        .api.elements(
          this.elements.publicLinkName.locateStrategy,
          util.format(fileNameSelectorXpath, linkName),
          (result) => {
            isPresent = result.value.length > 0
          })
      return isPresent
    },
    /**
     * creates a new public link
     *
     * @param {Object} settings - Parameters to be set up for a new public link share
     * @param {string} settings.role - Role of the viewer of the public link
     * @param {string} settings.name - Name of the public link share
     * @param {string} settings.password - Password for a public link share
     * @param {string} settings.expireDate - Expire date for a public link share
     * @returns {*}
     */
    addNewLink: async function (settings = null) {
      const addLinkButtonXpath = this.elements.publicLinkContainer.selector +
        this.elements.addLinkButton.selector
      const createLinkButtonXpath = this.elements.publicLinkContainer.selector +
        this.elements.createLinkButton.selector
      const addLinkButton = {
        locateStrategy: this.elements.addLinkButton.locateStrategy,
        selector: addLinkButtonXpath
      }
      const createLinkButton = {
        locateStrategy: this.elements.createLinkButton.locateStrategy,
        selector: createLinkButtonXpath
      }
      await this
        .waitForElementVisible(addLinkButton)
        .click(addLinkButton)
        .waitForElementVisible(createLinkButton)
      if (settings !== null) {
        for (const [key, value] of Object.entries(settings)) {
          await this.setPublicLinkForm(key, value)
        }
      }
      return this
        .initAjaxCounters()
        .waitForElementVisible(createLinkButton)
        .click(createLinkButton)
        .waitForElementNotPresent(createLinkButton)
        .waitForOutstandingAjaxCalls()
    },
    /**
     * gets the text of all public links of the currently open public link tab
     *
     * @returns {Promise<string[]>}
     */
    getPublicLinkList: async function () {
      const promiseList = []
      const publicLinkInfoXpath = this.elements.publicLinkContainer.selector + this.elements.publicLinkInformation.selector
      await this.initAjaxCounters()
        .waitForElementPresent({ locateStrategy: 'xpath', selector: publicLinkInfoXpath, abortOnFailure: false })
        .waitForOutstandingAjaxCalls()
        .api.elements('xpath', publicLinkInfoXpath, result => {
          result.value.map(item => {
            promiseList.push(new Promise((resolve) => {
              this.api.elementIdText(item.ELEMENT, text => {
                resolve(text.value)
              })
            })
            )
          })
        })
      return Promise.all(promiseList)
    },
    /**
     *
     * @returns {Promise<string>}
     */
    getErrorMessage: async function () {
      let message
      const errorMessageXpath = this.elements.publicLinkContainer.selector +
        this.elements.errorMessageInsidePublicLinkContainer.selector
      await this.getText('xpath', errorMessageXpath, function (result) {
        message = result.value
      })
      return message
    },
    /**
     * clicks the 'copy-public-link-uri' button of a public link
     *
     * @param {string} linkName Name of the public link whose URL is to be copied
     */
    copyPublicLinkURI: function (linkName) {
      const copyBtnXpath = util.format(this.elements.publicLinkURLCopyButton.selector, linkName)
      const copyBtnSelector = {
        selector: copyBtnXpath,
        locateStrategy: this.elements.publicLinkURLCopyButton.locateStrategy
      }
      return this
        .waitForElementVisible(copyBtnSelector)
        .click(copyBtnSelector)
    }
  },
  elements: {
    publicLinkContainer: {
      selector: '//*[@id="oc-files-file-link"]',
      locateStrategy: 'xpath'
    },
    publicLinkInformation: {
      selector: '//li',
      locateStrategy: 'xpath'
    },
    publicLinkName: {
      selector: '//li//span[.="%s"]',
      locateStrategy: 'xpath'
    },
    addLinkButton: {
      selector: '//button[contains(.,"Add public link")]',
      locateStrategy: 'xpath'
    },
    createLinkButton: {
      selector: '//button[contains(.,"Create")]',
      locateStrategy: 'xpath'
    },
    selectRoleButton: {
      selector: '#files-file-links-role-button'
    },
    rolesDropdown: {
      selector: '#files-file-links-roles-dropdown'
    },
    roleViewer: {
      selector: '#files-file-links-role-viewer'
    },
    roleContributor: {
      selector: '#files-file-links-role-contributor'
    },
    roleEditor: {
      selector: '#files-file-links-role-editor'
    },
    roleUploader: {
      selector: '#files-file-links-role-uploader'
    },
    errorMessageInsidePublicLinkContainer: {
      selector: '//div[contains(@class, "uk-alert-danger")]',
      locateStrategy: 'xpath'
    },
    publicLinkNameInputField: {
      selector: '//input[@id="oc-files-file-link-name"]',
      locateStrategy: 'xpath'
    },
    publicLinkEditButton: {
      selector: '//span[.="%s"]/../..//button[@aria-label="Edit public link"]',
      locateStrategy: 'xpath'
    },
    publicLinkDeleteButton: {
      selector: '//span[.="%s"]/../..//button[@aria-label="Delete public link"]',
      locateStrategy: 'xpath'
    },
    publicLinkURLCopyButton: {
      selector: '//span[.="%s"]/../..//button[@aria-label="Copy link url"]',
      locateStrategy: 'xpath'
    },
    publicLinkPasswordField: {
      selector: '//input[@type="password"]',
      locateStrategy: 'xpath'
    },
    publicLinkDeletePasswordButton: {
      selector: '//*[@uk-tooltip="Remove password"]',
      locateStrategy: 'xpath'
    },
    publicLinkSaveButton: {
      selector: '//button/span[.="Save"]',
      locateStrategy: 'xpath'
    },
    publicLinkDeleteExpirationDateButton: {
      selector: '//*[@uk-tooltip="Remove expiration date"]',
      locateStrategy: 'xpath'
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
