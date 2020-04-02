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
      const linkRowEditButtonSelector = this.elements.publicLinkContainer.selector +
        util.format(this.elements.publicLinkEditButton.selector, linkName)
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
        value = sharingHelper.calculateDate(value)
        return this.api.page
          .FilesPageElement
          .sharingDialog()
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
    editPublicLink: async function (linkName, editData) {
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
      const linkRowDeleteButtonSelector = this.elements.publicLinkContainer.selector +
        util.format(this.elements.publicLinkDeleteButton.selector, linkName)
      const linkRowDeleteButton = {
        locateStrategy: this.elements.publicLinkDeleteButton.locateStrategy,
        selector: linkRowDeleteButtonSelector
      }
      return this
        .initAjaxCounters()
        .waitForElementVisible(linkRowDeleteButton)
        .pause(500)
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
      await this
        .waitForElementVisible('@publicLinkAddButton')
        .click('@publicLinkAddButton')
        .waitForElementVisible('@publicLinkCreateButton')
      if (settings !== null) {
        for (const [key, value] of Object.entries(settings)) {
          await this.setPublicLinkForm(key, value)
        }
      }
      return this
        .initAjaxCounters()
        .waitForElementVisible('@publicLinkCreateButton')
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
    setPublicLinkDate: async function (days) {
      await this
        .waitForElementVisible('@publicLinkAddButton')
        .click('@publicLinkAddButton')
        .waitForElementVisible('@publicLinkCreateButton')
      if (days) {
        const isExpiryDateChanged = await this.setPublicLinkForm('expireDate', days)
        if (!isExpiryDateChanged) {
          console.log('WARNING: Cannot create share with disabled expiration date!')
          return
        }
      }
      return this
        .initAjaxCounters()
        .waitForElementVisible('@publicLinkCreateButton')
        .click('@publicLinkCreateButton')
        .waitForElementNotPresent('@publicLinkCreateButton')
        .waitForOutstandingAjaxCalls()
    },
    /**
     * Gets the data of all public links of the currently open public link tab
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

      const informationSelector = this.elements.publicLinkContainer.selector + this.elements.publicLinkInformation.selector

      let results = []

      let linkElementIds = null
      await this.initAjaxCounters()
        .waitForElementPresent({ locateStrategy: 'xpath', selector: informationSelector, abortOnFailure: false })
        .waitForOutstandingAjaxCalls()
        .api.elements('xpath', informationSelector, result => {
          linkElementIds = result.value.map(item => item[Object.keys(item)[0]])
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

          if (attrElementId) {
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
     * gets the urls of all public links of the currently open public link tab
     *
     * @returns {Promise<string>}
     */
    getPublicLinkUrls: async function () {
      const promiseList = []
      const publicLinkUrlXpath = this.elements.publicLinkContainer.selector +
        this.elements.publicLinkInformation.selector +
        this.elements.publicLinkUrl.selector
      await this.initAjaxCounters()
        .waitForElementPresent({
          locateStrategy: 'xpath',
          selector: publicLinkUrlXpath,
          abortOnFailure: false
        })
        .waitForOutstandingAjaxCalls()
        .api.elements('xpath', publicLinkUrlXpath, result => {
          result.value.map(item => {
            promiseList.push(new Promise((resolve) => {
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
      const copyBtnXpath = this.elements.publicLinkContainer.selector +
        util.format(this.elements.publicLinkURLCopyButton.selector, linkName)
      const copyBtnSelector = {
        selector: copyBtnXpath,
        locateStrategy: this.elements.publicLinkURLCopyButton.locateStrategy
      }
      return this
        .waitForElementVisible(copyBtnSelector)
        .click(copyBtnSelector)
    },
    copyPrivateLink: function () {
      const appSideBarElements = this.api.page.FilesPageElement.appSideBar().elements
      const sidebarLinksTabXpath = appSideBarElements.sidebarLinksTab.selector
      const sidebarCss = appSideBarElements.sideBar.selector

      return this
        .waitForElementVisible(sidebarCss)
        .useXpath()
        .waitForElementVisible(sidebarLinksTabXpath)
        .click(sidebarLinksTabXpath)
        .waitForElementVisible('@sidebarPrivateLinkLabel')
        .click('@sidebarPrivateLinkLabel')
        .waitForElementNotPresent('@sidebarPrivateLinkLabel')
        .waitForElementVisible('@sidebarPrivateLinkIconCopied')
        .waitForElementNotPresent('@sidebarPrivateLinkIconCopied')
        .waitForElementVisible('@sidebarPrivateLinkLabel')
        .useCss()
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
      selector: '.oc-files-file-link-url'
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
    rolesDropdown: {
      selector: '#files-file-link-roles-dropdown'
    },
    roleViewer: {
      selector: '#files-file-link-role-viewer'
    },
    roleContributor: {
      selector: '#files-file-link-role-contributor'
    },
    roleEditor: {
      selector: '#files-file-link-role-editor'
    },
    roleUploader: {
      selector: '#files-file-link-role-uploader'
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
      selector: '//a[.="%s"]/../..//button[contains(@class, "oc-files-file-link-edit")]',
      locateStrategy: 'xpath'
    },
    publicLinkDeleteButton: {
      selector: '//a[.="%s"]/../..//button[contains(@class, "oc-files-file-link-delete")]',
      locateStrategy: 'xpath'
    },
    publicLinkURLCopyButton: {
      selector: '//a[.="%s"]/../..//button[contains(@class, "oc-files-file-link-copy-url")]',
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
    sidebarPrivateLinkLabel: {
      selector: '#files-sidebar-private-link-label'
    },
    sidebarPrivateLinkIconCopied: {
      selector: '#files-sidebar-private-link-icon-copied'
    }
  }
}
