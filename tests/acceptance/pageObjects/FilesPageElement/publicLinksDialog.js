const util = require('util')
const _ = require('lodash')
const sharingHelper = require('../../helpers/sharingHelper')
const timeoutHelper = require('../../helpers/timeoutHelper')

module.exports = {
  commands: {
    /**
     * opens expiration date field on the webUI
     * @return {*}
     */
    openExpirationDatePicker: function () {
      this.useCss()
        .waitForElementVisible(
          '@expirationDateField',
          this.api.globals.waitForNegativeConditionTimeout
        )
        .click('@expirationDateField')
    },
    /**
     * clicks the edit button of public link
     *
     * @param linkName Name of the public link
     * @returns {Promise<void>}
     */
    clickLinkEditBtn: function (linkName) {
      const linkRowEditButtonSelector =
        this.elements.publicLinkContainer.selector +
        util.format(this.elements.publicLinkEditButton.selector, linkName)
      const linkRowEditButton = {
        locateStrategy: this.elements.publicLinkEditButton.locateStrategy,
        selector: linkRowEditButtonSelector
      }
      return this.waitForElementVisible(linkRowEditButton)
        .initAjaxCounters()
        .click(linkRowEditButton)
        .waitForOutstandingAjaxCalls()
    },

    clickLinkAddPasswordBtn: function (linkName) {
      const linkRowAddPasswordSelector =
        this.elements.publicLinkContainer.selector +
        util.format(this.elements.publicLinkAddPasswordButton.selector, linkName)
      const publicLinkAddPasswordButton = {
        locateStrategy: this.elements.publicLinkAddPasswordButton.locateStrategy,
        selector: linkRowAddPasswordSelector
      }
      return this.waitForElementVisible(publicLinkAddPasswordButton)
        .initAjaxCounters()
        .click(publicLinkAddPasswordButton)
        .waitForOutstandingAjaxCalls()
    },

    clickLinkEditPasswordBtn: function (linkName) {
      const linkRowEditPasswordSelector =
        this.elements.publicLinkContainer.selector +
        util.format(this.elements.publicLinkRenamePasswordButton.selector, linkName)
      const publicLinkRenamePasswordButton = {
        locateStrategy: this.elements.publicLinkRenamePasswordButton.locateStrategy,
        selector: linkRowEditPasswordSelector
      }
      return this.waitForElementVisible(publicLinkRenamePasswordButton)
        .initAjaxCounters()
        .click(publicLinkRenamePasswordButton)
        .waitForOutstandingAjaxCalls()
    },

    clickLinkEditNameBtn: function (linkName) {
      const linkRowEditNameSelector =
        this.elements.publicLinkContainer.selector +
        util.format(this.elements.publicLinkRenameButton.selector, linkName)
      const publicLinkRenameButton = {
        locateStrategy: this.elements.publicLinkRenameButton.locateStrategy,
        selector: linkRowEditNameSelector
      }
      return this.waitForElementVisible(publicLinkRenameButton)
        .initAjaxCounters()
        .click(publicLinkRenameButton)
        .waitForOutstandingAjaxCalls()
    },

    clickLinkEditExpirationBtn: function (linkName) {
      const linkRowEditExpirationDateSelector =
        this.elements.publicLinkContainer.selector +
        util.format(this.elements.publicLinkExpirationDateEditButton.selector, linkName)
      const publicLinkExpirationDateEditButton = {
        locateStrategy: this.elements.publicLinkExpirationDateEditButton.locateStrategy,
        selector: linkRowEditExpirationDateSelector
      }
      return this.waitForElementVisible(publicLinkExpirationDateEditButton)
        .initAjaxCounters()
        .click(publicLinkExpirationDateEditButton)
        .waitForOutstandingAjaxCalls()
    },
    isRemovePasswordBtnVisible: async function (linkName, expectedVisible = true) {
      let isVisible = false
      const publicLinkRemovePasswordSelector =
        this.elements.publicLinkContainer.selector +
        util.format(this.elements.publicLinkRemovePasswordButton.selector, linkName)
      const publicLinkRemovePasswordButton = {
        locateStrategy: this.elements.publicLinkRemovePasswordButton.locateStrategy,
        selector: publicLinkRemovePasswordSelector
      }

      const timeout = expectedVisible
        ? this.api.globals.waitForConditionTimeout
        : this.api.globals.waitForNegativeConditionTimeout

      await this.isVisible(
        {
          ...publicLinkRemovePasswordButton,
          timeout: timeoutHelper.parseTimeout(timeout),
          suppressNotFoundErrors: !expectedVisible
        },
        (result) => {
          isVisible = result.value === true
        }
      )
      return isVisible
    },

    /**
     * sets role or permissions for public link on webUI
     *
     * @param {string} role - e.g. Viewer, Contributor, Editor, Uploader
     * @returns {Promise<void>}
     */
    setPublicLinkInitialRole: function (role) {
      role = _(role).chain().toLower().startCase().replace(/\s/g, '').value()
      const selectedRoleDropdown = util.format(
        this.elements.publicLinkRoleSelectionDropdown.selector,
        role
      )
      return this.click('@selectRoleButton')
        .click(`@role${role}`)
        .useXpath()
        .waitForElementVisible(selectedRoleDropdown)
        .useCss()
    },
    /**
     * sets name of the public link share on webUI
     *
     * @param {string} linkName Name of the public link share
     *
     */
    setPublicLinkName: function (linkName) {
      return this.waitForElementVisible('@publicLinkNameInputField')
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
      return this.clearValue('@publicLinkPasswordField').setValue(
        '@publicLinkPasswordField',
        linkPassword
      )
    },
    /**
     * function sets different fields for public link
     *
     * @param key fields like name, password, expireDate, role
     * @param value values for the different fields to be set
     * @returns {*|Promise<void>|exports}
     */
    setPublicLinkForm: async function (key, value) {
      if (key === 'role') {
        return this.setPublicLinkInitialRole(value)
      } else if (key === 'name') {
        return this.setPublicLinkName(value)
      } else if (key === 'password') {
        return this.setPublicLinkPassword(value)
      } else if (key === 'expireDate') {
        value = sharingHelper.calculateDate(value)
        await this.openExpirationDatePicker()
        return this.api.page.FilesPageElement.expirationDatePicker().setExpirationDate(
          value,
          'link'
        )
      }
      return this
    },

    changeExpirationDate: async function (linkName, expiry) {
      const value = sharingHelper.calculateDate(expiry)
      await this.clickLinkEditBtn(linkName)
      await this.clickLinkEditExpirationBtn(linkName)
      return this.api.page.FilesPageElement.expirationDatePicker().setExpirationDate(value, 'link')
    },

    openRolesDrop: function (linkName) {
      const linkRowEditRoleButtonSelector =
        this.elements.publicLinkContainer.selector +
        util.format(this.elements.publicLinkEditRoleButton.selector, linkName)
      const linkRowEditRoleButton = {
        locateStrategy: this.elements.publicLinkEditRoleButton.locateStrategy,
        selector: linkRowEditRoleButtonSelector
      }
      return this.waitForElementVisible(linkRowEditRoleButton)
        .initAjaxCounters()
        .click(linkRowEditRoleButton)
        .waitForOutstandingAjaxCalls()
    },

    setPublicLinkRole: function (role) {
      role = _(role).chain().toLower().startCase().replace(/\s/g, '').value()
      return this.waitForElementVisible(`@role${role}`)
        .initAjaxCounters()
        .click(`@role${role}`)
        .waitForOutstandingAjaxCalls()
    },

    changeRole: async function (linkName, role) {
      await this.openRolesDrop(linkName)
      await this.setPublicLinkRole(role)
      return this
    },
    /**
     * clicks save button of public link form
     *
     * @returns {exports}
     */
    savePublicLink: async function () {
      await this.waitForElementVisible('@publicLinkSaveButton')
        .initAjaxCounters()
        .click('@publicLinkSaveButton')
      try {
        await this.waitForElementNotPresent({
          selector: '@publicLinkSaveButton'
        }).waitForOutstandingAjaxCalls()
      } catch (e) {
        throw new Error('ElementPresentError')
      }
      return this
    },
    /**
     * deletes existing public link share
     *
     * @param {string} linkName Name of the public link share of a resource to be deleted
     * @returns {exports}
     */
    removePublicLink: async function (linkName) {
      const linkRowDeleteButtonSelector =
        this.elements.publicLinkContainer.selector +
        util.format(this.elements.publicLinkDeleteButton.selector, linkName)
      const linkRowDeleteButton = {
        locateStrategy: this.elements.publicLinkDeleteButton.locateStrategy,
        selector: linkRowDeleteButtonSelector
      }
      await this.clickLinkEditBtn(linkName)
      return this.waitForElementVisible(linkRowDeleteButton)
        .initAjaxCounters()
        .click(linkRowDeleteButton)
        .waitForElementVisible('@dialog')
        .waitForAnimationToFinish() // wait for transition on the modal to finish
        .click('@dialogConfirmBtnEnabled')
        .waitForOutstandingAjaxCalls()
    },
    /**
     * cancels remove public link share action
     *
     * @param {string} linkName Name of the public link share of a resource to be deleted
     * @returns {exports}
     */
    cancelRemovePublicLink: async function (linkName) {
      const linkRowDeleteButtonSelector =
        this.elements.publicLinkContainer.selector +
        util.format(this.elements.publicLinkDeleteButton.selector, linkName)
      const linkRowDeleteButton = {
        locateStrategy: this.elements.publicLinkDeleteButton.locateStrategy,
        selector: linkRowDeleteButtonSelector
      }
      await this.clickLinkEditBtn(linkName)
      return this.waitForElementVisible(linkRowDeleteButton)
        .initAjaxCounters()
        .click(linkRowDeleteButton)
        .waitForElementVisible('@dialog')
        .waitForAnimationToFinish() // wait for transition on the modal to finish
        .click('@dialogCancelBtn')
        .waitForOutstandingAjaxCalls()
    },
    /**
     * checks if public link share with given name is present
     *
     * @param {string} linkName - Name of the public link share to be asserted
     * @returns {boolean}
     */
    isPublicLinkPresent: async function (linkName) {
      const fileNameSelectorXpath =
        this.elements.publicLinkContainer.selector + this.elements.publicLinkName.selector
      let isPresent
      await this.api.elements(
        this.elements.publicLinkName.locateStrategy,
        util.format(fileNameSelectorXpath, linkName),
        (result) => {
          isPresent = result.value.length > 0
        }
      )
      return isPresent
    },
    /**
     * creates a new public link
     *
     * @returns {*}
     */
    addNewLink: function () {
      return this.waitForElementVisible('@publicLinkCreateButton')
        .initAjaxCounters()
        .click('@publicLinkCreateButton')
        .waitForElementNotPresent('@popupNotificationMessage')
        .waitForOutstandingAjaxCalls()
    },
    /**
     * Gets the data of all public links of the currently open public link panel
     *
     * @param {Object.<String,Object>} subSelectors Map of arbitrary attribute name to selector to query
     * inside the collaborator element, defaults to all when null
     * @returns {Array.<Object>} array of link data
     */
    getPublicLinkList: async function (subSelectors = null) {
      if (subSelectors === null) {
        subSelectors = {
          name: this.elements.publicLinkSubName,
          role: this.elements.publicLinkSubRole,
          viaLabel: this.elements.publicLinkSubVia
        }
      }

      const informationSelector =
        this.elements.publicLinkContainer.selector + this.elements.publicLinkInformation.selector

      let results = []

      let linkElementIds = null
      await this.waitForElementPresent({
        locateStrategy: 'xpath',
        selector: informationSelector,
        abortOnFailure: false
      }).api.elements('xpath', informationSelector, (result) => {
        linkElementIds = result.value.map((item) => item[Object.keys(item)[0]])
      })

      results = linkElementIds.map(async (linkElementId) => {
        const linkResult = {}
        for (const attrName in subSelectors) {
          let attrElementId = null
          await this.api.elementIdElement(
            linkElementId,
            'css selector',
            subSelectors[attrName],
            (result) => {
              if (result.status !== -1) {
                attrElementId = result.value.ELEMENT
              }
            }
          )

          // hack to check for presence of via-button
          // since the redesign removed the visual via-text
          if (attrElementId && attrName === 'viaLabel') {
            linkResult.viaLabel = true
          } else if (attrElementId) {
            await this.api.elementIdText(attrElementId, (text) => {
              linkResult[attrName] = text.value
            })
          } else {
            linkResult[attrName] = null
          }
        }

        return linkResult
      })

      results = await Promise.all(results)
      return results
    },
    /**
     * gets the urls of all public links of the currently open public link panel
     *
     * @returns {Promise<string>}
     */
    getPublicLinkUrls: async function () {
      const promiseList = []
      const publicLinkUrlXpath =
        this.elements.publicLinkContainer.selector +
        this.elements.publicLinkInformation.selector +
        this.elements.publicLinkUrl.selector
      await this.waitForElementPresent({
        locateStrategy: 'xpath',
        selector: publicLinkUrlXpath,
        abortOnFailure: false
      }).api.elements('xpath', publicLinkUrlXpath, (result) => {
        result.value.forEach((item) => {
          promiseList.push(
            new Promise((resolve) => {
              this.api.elementIdAttribute(item.ELEMENT, 'innerText', (text) => {
                resolve(text)
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
      await this.getText(
        'xpath',
        this.elements.errorMessageInsidePublicLinkContainer.selector,
        function (result) {
          message = result.value
        }
      )
      console.log('\n\n', message, '\n\n')
      return message
    },

    getErrorMessageFromModal: async function () {
      let message
      await this.getText('.oc-modal-body-input .oc-text-input-message', function (result) {
        message = result.value
      })
      return message
    },

    changeName: async function (linkName, newName) {
      await this.clickLinkEditBtn(linkName)
      await this.clickLinkEditNameBtn(linkName)

      await this.useXpath()
        .waitForElementVisible('@dialog')
        .waitForAnimationToFinish()
        .clearValue('@dialogInput')
        .setValue('@dialogInput', newName)
        .useCss()

      await this.click('@dialogConfirmBtnEnabled')
    },

    changeLatestLinkName: async function (newName) {
      let latestLinkName
      await this.waitForElementVisible('@latestLinkName').getText(
        '@latestLinkName',
        (result) => (latestLinkName = result.value)
      )
      await this.changeName(latestLinkName, newName)
    },

    changeLatestLinkRole: async function (newRole) {
      let latestLinkName
      await this.waitForElementVisible('@latestLinkName').getText(
        '@latestLinkName',
        (result) => (latestLinkName = result.value)
      )
      await this.changeRole(latestLinkName, newRole)
    },

    addPassword: async function (linkName, password) {
      await this.clickLinkEditBtn(linkName)
      await this.clickLinkAddPasswordBtn(linkName)

      await this.useXpath()
        .waitForElementVisible('@dialog')
        .waitForAnimationToFinish()
        .clearValue('@dialogInput')
        .setValue('@dialogInput', password)
        .useCss()

      await this.click('@dialogConfirmBtnEnabled')
    },

    setRequiredPassword: async function (password) {
      await this.useXpath()
        .waitForElementVisible('@dialog')
        .waitForAnimationToFinish()
        .clearValue('@dialogInput')
        .setValue('@dialogInput', password)
        .useCss()

      await this.waitForElementVisible('@dialogConfirmBtnEnabled')
        .initAjaxCounters()
        .click('@dialogConfirmBtnEnabled')
        .waitForOutstandingAjaxCalls()
    },

    changePassword: async function (linkName, password) {
      await this.clickLinkEditBtn(linkName)
      await this.clickLinkEditPasswordBtn(linkName)

      await this.useXpath()
        .waitForElementVisible('@dialog')
        .waitForAnimationToFinish()
        .clearValue('@dialogInput')
        .setValue('@dialogInput', password)
        .useCss()

      await this.click('@dialogConfirmBtnEnabled')
    },

    /**
     * clicks the 'copy-public-link-uri' button of a public link
     *
     * @param {string} linkName Name of the public link whose URL is to be copied
     */
    copyPublicLinkURI: function (linkName) {
      const copyBtnXpath =
        this.elements.publicLinkContainer.selector +
        util.format(this.elements.publicLinkURLCopyButton.selector, linkName)
      const copyBtnSelector = {
        selector: copyBtnXpath,
        locateStrategy: this.elements.publicLinkURLCopyButton.locateStrategy
      }
      return this.waitForElementVisible(copyBtnSelector).click(copyBtnSelector)
    },
    /**
     * extracts set value in expiration date trigger button
     * @return {Promise<*>}
     */
    getExpirationDate: async function () {
      let expirationDate
      await this.waitForElementVisible('@expirationDateFieldWrapper')
      await this.waitForElementVisible('@editor').getAttribute(
        '@expirationDateFieldWrapper',
        'value',
        (result) => {
          const date = new Date(result.value)
          const dateString =
            date.getFullYear() +
            '-' +
            String(date.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(date.getDate()).padStart(2, '0') +
            ' 00:00:00'
          expirationDate = dateString
        }
      )
      return expirationDate
    }
  },
  elements: {
    popupNotificationMessage: {
      selector:
        '//*[contains(@class, "oc-notification-message")]//div[contains(@class, "oc-notification-message-title")]',
      locateStrategy: 'xpath'
    },
    latestLinkName: {
      selector: '//div[@id="oc-files-file-link"]//ul/li[1]//h4',
      locateStrategy: 'xpath'
    },
    expirationDateFieldWrapper: {
      selector: '#oc-files-file-link-expire-date'
    },
    expirationDateField: {
      selector: '#files-links-expiration-btn'
    },
    publicLinkContainer: {
      selector: '//*[@id="oc-files-file-link"]',
      locateStrategy: 'xpath'
    },
    publicLinkInformation: {
      selector: '//li',
      locateStrategy: 'xpath'
    },
    publicLinkUrl: {
      selector: '//p[contains(@class, "oc-files-file-link-url")]',
      locateStrategy: 'xpath'
    },
    publicLinkName: {
      selector: '//li//span[.="%s"]',
      locateStrategy: 'xpath'
    },
    publicLinkSubName: {
      selector: '.oc-files-file-link-name'
    },
    publicLinkSubRole: {
      selector: '.link-details .link-current-role'
    },
    publicLinkSubVia: {
      selector: '.oc-files-file-link-via'
    },
    selectRoleButton: {
      selector: '#files-file-link-role-button'
    },
    roleViewer: {
      selector: '#files-role-viewer'
    },
    roleContributor: {
      selector: '#files-role-contributor'
    },
    roleEditor: {
      selector: '#files-role-editor'
    },
    roleUploader: {
      selector: '#files-role-uploader'
    },
    publicLinkEditRoleButton: {
      selector:
        '//h4[contains(@class, "oc-files-file-link-name") and text()="%s"]//ancestor::li//div[contains(@class, "link-details")]/div/button[contains(@class, "link-role-dropdown-toggle")]',
      locateStrategy: 'xpath'
    },
    publicLinkEditButton: {
      selector:
        '//h4[contains(@class, "oc-files-file-link-name") and text()="%s"]//ancestor::li//div[contains(@class, "details-buttons")]//button[contains(@class, "edit-drop-trigger")]',
      locateStrategy: 'xpath'
    },
    publicLinkRenameButton: {
      selector:
        '//h4[contains(@class, "oc-files-file-link-name") and text()="%s"]//ancestor::li//div[contains(@class, "details-buttons")]//button/span[text()="Rename"]',
      locateStrategy: 'xpath'
    },
    publicLinkAddPasswordButton: {
      selector:
        '//h4[contains(@class, "oc-files-file-link-name") and text()="%s"]//ancestor::li//div[contains(@class, "details-buttons")]//button/span[text()="Add password"]',
      locateStrategy: 'xpath'
    },
    publicLinkRemovePasswordButton: {
      selector:
        '//h4[contains(@class, "oc-files-file-link-name") and text()="%s"]//ancestor::li//div[contains(@class, "details-buttons")]//button/span[text()="Remove password"]',
      locateStrategy: 'xpath'
    },
    publicLinkRenamePasswordButton: {
      selector:
        '//h4[contains(@class, "oc-files-file-link-name") and text()="%s"]//ancestor::li//div[contains(@class, "details-buttons")]//button/span[text()="Edit password"]',
      locateStrategy: 'xpath'
    },
    publicLinkExpirationDateEditButton: {
      selector:
        '//h4[contains(@class, "oc-files-file-link-name") and text()="%s"]//ancestor::li//div[contains(@class, "details-buttons")]//button/span[text()="Edit expiration date"]',
      locateStrategy: 'xpath'
    },
    publicLinkDeleteButton: {
      selector:
        '//h4[contains(@class, "oc-files-file-link-name") and text()="%s"]//ancestor::li//div[contains(@class, "details-buttons")]//button/span[text()="Delete link"]',
      locateStrategy: 'xpath'
    },
    publicLinkURLCopyButton: {
      selector:
        '//h4[contains(@class, "oc-files-file-link-name") and text()="%s"]/../../..//button[contains(@class, "oc-files-public-link-copy-url")]',
      locateStrategy: 'xpath'
    },
    publicLinkPasswordField: {
      selector: '//input[@type="password"]',
      locateStrategy: 'xpath'
    },
    publicLinkDeletePasswordButton: {
      selector: '#oc-files-file-link-password-delete'
    },
    publicLinkCreateButton: {
      selector: '#files-file-link-add'
    },
    publicLinkRoleSelectionDropdown: {
      selector: '//div[contains(@class, "files-file-link-role-button-wrapper")]//span[.="%s"]',
      locateStrategy: 'xpath'
    },
    dialog: {
      selector: '.oc-modal'
    },
    dialogInput: {
      selector: '.oc-modal-body-input .oc-text-input'
    },
    dialogConfirmBtnEnabled: {
      selector: '.oc-modal-body-actions-confirm'
    },
    dialogCancelBtn: {
      selector: '.oc-modal-body-actions-cancel'
    }
  }
}
