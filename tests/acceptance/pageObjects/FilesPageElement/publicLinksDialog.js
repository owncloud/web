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
    clickLinkEditBtn: function(linkName) {
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
    /**
     * sets role or permissions for public link on webUI
     *
     * @param {string} role - e.g. Viewer, Contributor, Editor, Uploader
     * @returns {Promise<void>}
     */
    setPublicLinkRole: function(role) {
      role = _(role)
        .chain()
        .toLower()
        .startCase()
        .replace(/\s/g, '')
        .value()
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
    setPublicLinkName: function(linkName) {
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
    setPublicLinkPassword: function(linkPassword) {
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
    setPublicLinkForm: function(key, value) {
      if (key === 'role') {
        return this.setPublicLinkRole(value)
      } else if (key === 'name') {
        return this.setPublicLinkName(value)
      } else if (key === 'password') {
        return this.setPublicLinkPassword(value)
      } else if (key === 'expireDate') {
        value = sharingHelper.calculateDate(value)
        return this.api.page.FilesPageElement.sharingDialog()
          .openExpirationDatePicker()
          .setExpirationDate(value, 'link')
      }
      return this
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
    editPublicLink: async function(linkName, editData) {
      await this.clickLinkEditBtn(linkName)
      for (const [key, value] of Object.entries(editData)) {
        await this.setPublicLinkForm(key, value)
      }
      return this
    },
    /**
     * clicks save button of public link form
     *
     * @returns {exports}
     */
    savePublicLink: async function() {
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
    removePublicLink: function(linkName) {
      const linkRowDeleteButtonSelector =
        this.elements.publicLinkContainer.selector +
        util.format(this.elements.publicLinkDeleteButton.selector, linkName)
      const linkRowDeleteButton = {
        locateStrategy: this.elements.publicLinkDeleteButton.locateStrategy,
        selector: linkRowDeleteButtonSelector
      }
      return this.waitForElementVisible(linkRowDeleteButton)
        .initAjaxCounters()
        .click(linkRowDeleteButton)
        .waitForElementVisible('@dialog')
        .waitForAnimationToFinish()
        .click('@dialogConfirmBtn')
        .waitForAnimationToFinish()
        .waitForOutstandingAjaxCalls()
    },
    /**
     * checks if public link share with given name is present
     *
     * @param {string} linkName - Name of the public link share to be asserted
     * @returns {boolean}
     */
    isPublicLinkPresent: async function(linkName) {
      const fileNameSelectorXpath =
        this.elements.publicLinkContainer.selector + this.elements.publicLinkName.selector
      let isPresent
      await this.waitForAnimationToFinish().api.elements(
        this.elements.publicLinkName.locateStrategy,
        util.format(fileNameSelectorXpath, linkName),
        result => {
          isPresent = result.value.length > 0
        }
      )
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
    addNewLink: async function(settings = null) {
      await this.waitForElementVisible('@publicLinkAddButton')
        .click('@publicLinkAddButton')
        .waitForElementVisible('@publicLinkCreateButton')
      if (settings !== null) {
        for (const [key, value] of Object.entries(settings)) {
          await this.setPublicLinkForm(key, value)
        }
      }
      return this.waitForElementVisible('@publicLinkCreateButton')
        .initAjaxCounters()
        .click('@publicLinkCreateButton')
        .waitForElementNotPresent('@publicLinkCreateButton')
        .waitForOutstandingAjaxCalls()
    },
    /**
     * tries to create a new public link in specified date
     *
     * @param {string} settings.expireDate - Expire date for a public link share
     * @returns {*}
     */
    setPublicLinkDate: async function(days) {
      await this.waitForElementVisible('@publicLinkAddButton')
        .click('@publicLinkAddButton')
        .waitForElementVisible('@publicLinkCreateButton')
      if (days) {
        const isExpiryDateChanged = await this.setPublicLinkForm('expireDate', days)
        if (!isExpiryDateChanged) {
          console.log('WARNING: Cannot create share with disabled expiration date!')
          return
        }
      }
      return this.waitForElementVisible('@publicLinkCreateButton')
        .initAjaxCounters()
        .click('@publicLinkCreateButton')
        .waitForElementNotPresent('@publicLinkCreateButton')
        .waitForOutstandingAjaxCalls()
    },
    /**
     * Gets the data of all public links of the currently open public link accordion item
     *
     * @param {Object.<String,Object>} subSelectors Map of arbitrary attribute name to selector to query
     * inside the collaborator element, defaults to all when null
     * @returns {Array.<Object>} array of link data
     */
    getPublicLinkList: async function(subSelectors = null) {
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
      }).api.elements('xpath', informationSelector, result => {
        linkElementIds = result.value.map(item => item[Object.keys(item)[0]])
      })

      results = linkElementIds.map(async linkElementId => {
        const linkResult = {}
        for (const attrName in subSelectors) {
          let attrElementId = null
          await this.api.elementIdElement(
            linkElementId,
            'css selector',
            subSelectors[attrName],
            result => {
              if (result.status !== -1) {
                attrElementId = result.value.ELEMENT
              }
            }
          )

          if (attrElementId) {
            await this.api.elementIdText(attrElementId, text => {
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
     * gets the urls of all public links of the currently open public link accordion item
     *
     * @returns {Promise<string>}
     */
    getPublicLinkUrls: async function() {
      const promiseList = []
      const publicLinkUrlXpath =
        this.elements.publicLinkContainer.selector +
        this.elements.publicLinkInformation.selector +
        this.elements.publicLinkUrl.selector
      await this.waitForElementPresent({
        locateStrategy: 'xpath',
        selector: publicLinkUrlXpath,
        abortOnFailure: false
      }).api.elements('xpath', publicLinkUrlXpath, result => {
        result.value.map(item => {
          promiseList.push(
            new Promise(resolve => {
              this.api.elementIdAttribute(item.ELEMENT, 'href', href => {
                resolve(href.value)
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
    getErrorMessage: async function() {
      let message
      const errorMessageXpath =
        this.elements.publicLinkContainer.selector +
        this.elements.errorMessageInsidePublicLinkContainer.selector
      await this.getText('xpath', errorMessageXpath, function(result) {
        message = result.value
      })
      return message
    },
    /**
     * clicks the 'copy-public-link-uri' button of a public link
     *
     * @param {string} linkName Name of the public link whose URL is to be copied
     */
    copyPublicLinkURI: function(linkName) {
      const copyBtnXpath =
        this.elements.publicLinkContainer.selector +
        util.format(this.elements.publicLinkURLCopyButton.selector, linkName)
      const copyBtnSelector = {
        selector: copyBtnXpath,
        locateStrategy: this.elements.publicLinkURLCopyButton.locateStrategy
      }
      return this.waitForElementVisible(copyBtnSelector).click(copyBtnSelector)
    },
    copyPrivateLink: function() {
      const linksAccordionItem = this.api.page.FilesPageElement.appSideBar().elements
        .linksAccordionItem
      return this.waitForElementVisible(this.api.page.personalPage().elements.sideBar)
        .waitForElementVisible(linksAccordionItem)
        .click(linksAccordionItem)
        .waitForElementVisible('@privateLinkURLCopyButton')
        .click('@privateLinkURLCopyButton')
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
    publicLinkUrl: {
      selector: '//a[contains(@class, "oc-files-file-link-url")]',
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
      selector: '.oc-files-file-link-role'
    },
    publicLinkSubVia: {
      selector: '.oc-files-file-link-via'
    },
    publicLinkAddButton: {
      selector: '#files-file-link-add'
    },
    addLinkButton: {
      selector: '#files-file-link-add'
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
    errorMessageInsidePublicLinkContainer: {
      selector: '//div[contains(@class, "oc-alert-danger")]',
      locateStrategy: 'xpath'
    },
    publicLinkNameInputField: {
      selector: '//input[@id="oc-files-file-link-name"]',
      locateStrategy: 'xpath'
    },
    publicLinkEditButton: {
      selector:
        '//h5[contains(@class, "oc-files-file-link-name") and text()="%s"]/../../..//button[contains(@class, "oc-files-file-link-edit")]',
      locateStrategy: 'xpath'
    },
    publicLinkDeleteButton: {
      selector:
        '//h5[contains(@class, "oc-files-file-link-name") and text()="%s"]/../../..//button[contains(@class, "oc-files-file-link-delete")]',
      locateStrategy: 'xpath'
    },
    publicLinkURLCopyButton: {
      selector:
        '//h5[contains(@class, "oc-files-file-link-name") and text()="%s"]/../../..//button[contains(@class, "oc-files-public-link-copy-url")]',
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
      selector: '#oc-files-file-link-create'
    },
    publicLinkSaveButton: {
      selector: '#oc-files-file-link-save'
    },
    privateLinkURLCopyButton: {
      selector: '.oc-files-private-link-copy-url'
    },
    publicLinkRoleSelectionDropdown: {
      selector: '//div[contains(@class, "files-file-link-role-button-wrapper")]//span[.="%s"]',
      locateStrategy: 'xpath'
    },
    dialog: {
      selector: '.oc-modal'
    },
    dialogConfirmBtn: {
      selector: '.oc-modal-body-actions-confirm'
    }
  }
}
