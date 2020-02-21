const groupSharePostfix = '\nGroup'
const userSharePostfix = '\nUser'
const federationSharePostfix = '\nRemote user'
const util = require('util')
const _ = require('lodash')
const { COLLABORATOR_PERMISSION_ARRAY } = require('../../helpers/sharingHelper')
const { client } = require('nightwatch-api')
const collaboratorDialog = client.page.FilesPageElement.SharingDialog.collaboratorsDialog()

module.exports = {
  commands: {
    /**
     *
     * @param {string} permissions
     */
    getArrayFromPermissionString: function (permissions) {
      permissions = permissions.replace(/\s/g, '')
      return permissions.split(',').filter(x => x)
    },
    /**
     *
     * @param {string} permission
     */
    getPermissionCheckbox: function (permission) {
      return util.format(this.elements.permissionCheckbox.selector, permission)
    },
    /**
     * gets share permission message whether is allowed to share or not
     *
     * @returns {Promise<string>}
     */
    getSharingPermissionMsg: async function () {
      let shareResponse
      // eslint-disable-next-line no-unused-expressions
      this.api.expect.element(this.elements.addShareSaveButton.selector).not.to.be.present
      await this.api.getText(this.elements.noResharePermissions.selector,
        function (result) {
          shareResponse = result.value
        }
      )
      return shareResponse
    },

    /**
     * Return first elementID that matches given selector and is visible
     *
     * @param {string} using
     * @param {string} value
     *
     * @return {Promise<string|null>}
     */
    getVisibleElementID: async function (using, value) {
      let visibleElementID = null
      await this.api.elements(using, value, response => {
        for (const { ELEMENT } of response.value) {
          this.api.elementIdDisplayed(ELEMENT, function (result) {
            if (result.value === true) {
              visibleElementID = ELEMENT
            }
          })
          if (visibleElementID !== null) break
        }
      })
      return visibleElementID
    },

    /**
     *
     * @param {string} sharee
     */
    removePendingCollaboratorForShare: function (sharee) {
      const newCollaboratorXpath = util.format(this.elements.newCollaboratorItems.selector, sharee)
      const removeCollaboratorBtnXpath = newCollaboratorXpath + this.elements.newCollaboratorRemoveButton.selector

      return this.useXpath().click(removeCollaboratorBtnXpath).useCss()
    },

    /**
     *
     * @param {string} sharee
     * @param {boolean} [shareWithGroup=false]
     */
    selectCollaboratorForShare: async function (receiver, shareWithGroup = false, remoteShare = false) {
      let sharee = receiver
      if (remoteShare) sharee = util.format('%s@%s', receiver, this.api.globals.remote_backend_url)
      // We need waitForElementPresent here.
      // waitForElementVisible would break even with 'abortOnFailure: false' if the element is not present
      await this.enterAutoComplete(sharee)
        .waitForElementPresent({
          selector: '@sharingAutoCompleteDropDownElements',
          abortOnFailure: false
        }, (result) => {
          if (result.value === false) {
            // sharing dropdown was not shown
            console.log('WARNING: no sharing autocomplete dropdown found, retry typing')
            this.clearValue('@sharingAutoComplete')
              .enterAutoComplete(sharee)
              .waitForElementVisible('@sharingAutoCompleteDropDownElements')
          }
        })

      const webElementIdList = await this.getShareAutocompleteWebElementIdList()

      let index = 0
      for (; index !== webElementIdList.length; index++) {
        let wasFound = false
        const webElementId = webElementIdList[index]
        await this.api.elementIdText(webElementId, (text) => {
          let suffix = (shareWithGroup === true) ? groupSharePostfix : userSharePostfix
          suffix = (remoteShare === true) ? federationSharePostfix : suffix
          if (text.value === sharee + suffix) {
            wasFound = true
            this.api
              .elementIdClick(webElementId)
              .waitForOutstandingAjaxCalls()
          }
        })
        if (wasFound === true) break
      }

      if (index === webElementIdList.length) {
        // * we won't see this probably, unless dropdown gives different results than entered
        throw new Error(`Could not find ${sharee} on the sharing auto-completion list.`)
      }
    },

    /**
     * @param {string} permissions
     */
    selectPermissionsOnPendingShare: async function (permissions) {
      const permissionArray = this.getArrayFromPermissionString(permissions)
      for (const permission of permissionArray) {
        const permissionCheckbox = this.getPermissionCheckbox(permission)
        const elementID = await this.getVisibleElementID('xpath', permissionCheckbox)
        if (elementID === null) {
          throw new Error(`Checkbox is not visible for permission ${permission}`)
        }
        await this.api.elementIdClick(elementID)
      }
      return this
    },

    /**
     *
     * @param {string} sharee
     * @param {boolean} shareWithGroup
     * @param {string} role
     * @param {string} permissions
     */
    shareWithUserOrGroup: async function (sharee, shareWithGroup = false, role, permissions, remote = false) {
      await collaboratorDialog.clickCreateShare()
      await this.selectCollaboratorForShare(sharee, shareWithGroup, remote)
      await this.selectRoleForNewCollaborator(role)
      if (permissions === undefined) {
        return this.confirmShare()
      }
      await this.selectPermissionsOnPendingShare(permissions)

      return this.confirmShare()
    },
    /**
     *
     * @param {String} role
     */
    selectRoleForNewCollaborator: function (role) {
      role = _(role).chain().toLower().startCase().replace(/\s/g, '').value()
      return this.waitForElementPresent('@newCollaboratorSelectRoleButton')
        .click('@newCollaboratorSelectRoleButton')
        .waitForElementVisible('@newCollaboratorRolesDropdown')
        .waitForElementVisible(`@newCollaboratorRole${role}`)
        .click(`@newCollaboratorRole${role}`)
        .waitForElementNotVisible('@newCollaboratorRolesDropdown')
    },
    confirmShare: function () {
      return this.waitForElementPresent('@addShareSaveButton')
        .initAjaxCounters()
        .click('@addShareSaveButton')
        .waitForOutstandingAjaxCalls()
        .waitForElementNotPresent('@addShareSaveButton')
    },
    saveCollaboratorPermission: function () {
      return this.waitForElementVisible('@saveShareButton')
        .initAjaxCounters()
        .click('@saveShareButton')
        .waitForOutstandingAjaxCalls()
        .waitForElementNotPresent('@saveShareButton')
    },
    clickCancel: function () {
      return this
        .waitForElementVisible('@cancelButton')
        .click('@cancelButton')
    },
    /**
     * Toggle the checkbox to set a certain permission for a share
     * Needs the collaborator information to be expanded
     *
     * @param {string} permission
     */
    toggleSinglePermission: async function (permission) {
      const permissionCheckbox = this.getPermissionCheckbox(permission)
      const elementID = await this.getVisibleElementID('xpath', permissionCheckbox)
      if (!elementID) {
        throw new Error(`permission ${permission} is not visible `)
      }

      this.api.elementIdClick(elementID)
      return this
    },
    /**
     * Get the state of permissions for current share in the screen
     * The keys gives the permissions that are currently visible in the screen
     * The values {bool} gives the state of the permissions
     *
     * @return {Promise<Object.<string, boolean>>}  eg - {share: true, change: false}
     */
    getSharePermissions: async function () {
      const permissions = {}
      const panelSelector = this.elements.sharingSidebarRoot.selector
      let permissionToggle
      for (let i = 0; i < COLLABORATOR_PERMISSION_ARRAY.length; i++) {
        permissionToggle = panelSelector + util.format(
          this.elements.permissionCheckbox.selector,
          COLLABORATOR_PERMISSION_ARRAY[i]
        )

        await this.api.element('xpath', permissionToggle, result => {
          if (!result.value.ELEMENT) {
            return
          }
          return this.api.elementIdSelected(result.value.ELEMENT, result => {
            permissions[COLLABORATOR_PERMISSION_ARRAY[i]] = result.value
          })
        })
      }
      return permissions
    },
    /**
     *
     * @param {string} collaborator
     * @param {string} requiredPermissions
     */
    changeCustomPermissionsTo: async function (collaborator, requiredPermissions) {
      await collaboratorDialog.clickEditShare(collaborator)

      const requiredPermissionArray = this.getArrayFromPermissionString(requiredPermissions)
      const sharePermissions = await this.getSharePermissions()

      let changed = false
      for (const permission in sharePermissions) {
        if (
          (sharePermissions[permission] && !requiredPermissionArray.includes(permission)) ||
          (!sharePermissions[permission] && requiredPermissionArray.includes(permission))
        ) {
          changed = true
          await this.toggleSinglePermission(permission)
        }
      }
      if (changed) {
        await this.saveCollaboratorPermission()
      } else {
        await this.clickCancel()
      }
    },
    /**
     *
     * @param {string} collaborator
     * @param {string} permissions
     */
    getDisplayedPermission: async function (collaborator) {
      await collaboratorDialog.clickEditShare(collaborator)
      // read the permissions from the checkboxes
      const currentSharePermissions = await this.getSharePermissions()
      await this.clickCancel()
      return currentSharePermissions
    },
    /**
     *
     * @param {string} collaborator
     */
    disableAllCustomPermissions: async function (collaborator) {
      await collaboratorDialog.clickEditShare(collaborator)
      const sharePermissions = await this.getSharePermissions(collaborator)
      const enabledPermissions = Object.keys(sharePermissions)
        .filter(permission => sharePermissions[permission] === true)

      for (const permission of enabledPermissions) {
        await this.toggleSinglePermission(permission)
      }
      await this.saveCollaboratorPermission()
    },
    /**
     *
     * @param {string} input
     */
    enterAutoComplete: function (input) {
      return this.initAjaxCounters()
        .waitForElementVisible('@sharingAutoComplete')
        .setValueBySingleKeys('@sharingAutoComplete', input)
        .waitForOutstandingAjaxCalls()
    },
    /**
     *
     * @returns {Promise.<string[]>} Array of autocomplete items
     */
    getShareAutocompleteItemsList: async function () {
      const webElementIdList = await this.getShareAutocompleteWebElementIdList()
      const itemsListPromises = webElementIdList.map((webElementId) => {
        return new Promise((resolve, reject) => {
          this.api.elementIdText(webElementId, (text) => {
            resolve(text.value.trim())
          })
        })
      })
      return Promise.all(itemsListPromises)
    },
    /**
     * Returns all autocomplete web element ids.
     * If the button "show all" is present, this function will click it to make
     * sure we get an exhaustive list of results.
     *
     * @returns {Promise.<string[]>} Array of autocomplete webElementIds
     */
    getShareAutocompleteWebElementIdList: async function () {
      const webElementIdList = []
      const showAllResultsXpath = this.elements.sharingAutoCompleteShowAllResultsButton.selector
      // wait for autocomplete to finish loading
      try {
        await this.waitForElementVisible('@sharingAutoCompleteDropDown')
      } catch (e) {
        // FIXME: the dropdown will not appear when there are zero results
        // (https://github.com/owncloud/owncloud-design-system/issues/547)
        // so need to catch the error here
        return []
      }
      await this.waitForElementNotPresent('@sharingAutoCompleteSpinner')
      // note: some result lists don't have the "show all" button depending on the number of entries,
      // so we only click it if present
      await this.api.element('css selector', showAllResultsXpath, (result) => {
        if (result.status !== -1) {
          return this.click('@sharingAutoCompleteShowAllResultsButton')
        }
      })

      await this
        .api.elements('css selector', this.elements.sharingAutoCompleteDropDownElements.selector, (result) => {
          result.value.forEach((value) => {
            webElementIdList.push(value[Object.keys(value)[0]])
          })
        })
      return webElementIdList
    },
    /**
     *
     * @param {string} collaborator
     * @param {string} newRole
     * @returns {Promise}
     */
    changeCollaboratorRole: async function (collaborator, newRole) {
      await collaboratorDialog.clickEditShare(collaborator)
      await this.changeCollaboratorRoleInDropdown(newRole)
      return this.saveCollaboratorPermission()
    },
    /**
     * @params {string} newRole
     * @returns {Promise}
     */
    changeCollaboratorRoleInDropdown: function (newRole) {
      const newRoleButton = util.format(
        this.elements.roleButtonInDropdown.selector, newRole.toLowerCase()
      )
      return this
        .initAjaxCounters()
        .useXpath()
        .waitForElementVisible('@selectRoleButtonInCollaboratorInformation')
        .click('@selectRoleButtonInCollaboratorInformation')
        .waitForElementVisible(newRoleButton)
        .click(newRoleButton)
        .waitForOutstandingAjaxCalls()
    },
    /**
     *
     * @returns {string}
     */
    getGroupSharePostfix: function () {
      return groupSharePostfix
    },
    /**
     *
     * @returns {string}
     */
    getUserSharePostfix: function () {
      return userSharePostfix
    },
    /**
     * checks whether autocomplete list is visible
     *
     * @returns {Promise<boolean>}
     */
    isAutocompleteListVisible: async function () {
      let isVisible = false
      await this.api.elements(
        '@sharingAutoCompleteDropDownElements',
        (result) => {
          isVisible = result.value.length > 0
        }
      )
      return isVisible
    }
  },
  elements: {
    sharingSidebarRoot: {
      selector: '//*[@id="oc-files-sharing-sidebar"]',
      locateStrategy: 'xpath'
    },
    noResharePermissions: {
      selector: '#oc-files-sharing-sidebar .files-collaborators-no-reshare-permissions-message'
    },
    sharingAutoComplete: {
      selector: '#oc-sharing-autocomplete .oc-autocomplete-input'
    },
    sharingAutoCompleteSpinner: {
      selector: '#oc-sharing-autocomplete .oc-autocomplete-spinner'
    },
    sharingAutoCompleteDropDown: {
      selector: '#oc-sharing-autocomplete .oc-autocomplete-suggestion-list'
    },
    sharingAutoCompleteDropDownElements: {
      selector: '#oc-sharing-autocomplete .oc-autocomplete-suggestion .files-collaborators-autocomplete-user-text'
    },
    sharingAutoCompleteShowAllResultsButton: {
      selector: '.oc-autocomplete-suggestion-overflow'
    },
    sharedWithListItem: {
      selector: '//*[@id="file-share-list"]//*[@class="oc-user"]//div[.="%s"]/../..',
      locateStrategy: 'xpath'
    },
    collaboratorMoreInformation: {
      // within collaboratorInformationByCollaboratorName
      selector: '/a',
      locateStrategy: 'xpath'
    },
    cancelButton: {
      selector: '.files-collaborators-collaborator-cancel'
    },
    addShareSaveButton: {
      selector: '#files-collaborators-collaborator-save-new-share-button'
    },
    saveShareButton: {
      selector: '#files-collaborators-collaborator-save-share-button'
    },
    newCollaboratorSelectRoleButton: {
      selector: '#files-collaborators-role-button'
    },
    newCollaboratorRolesDropdown: {
      selector: '#files-collaborators-roles-dropdown'
    },
    newCollaboratorRoleViewer: {
      selector: '#files-collaborators-role-viewer'
    },
    newCollaboratorRoleEditor: {
      selector: '#files-collaborators-role-editor'
    },
    newCollaboratorItems: {
      selector: "//div[@id='oc-files-sharing-sidebar']//table[contains(@class, 'files-collaborators-collaborator-autocomplete-item')]//div[contains(., '%s')]/ancestor::tr[position()=1]"
    },
    newCollaboratorRemoveButton: {
      selector: "//button[contains(@class, 'files-collaborators-collaborator-autocomplete-item-remove')]"
    },
    newCollaboratorRoleAdvancedPermissions: {
      selector: '#files-collaborators-role-advancedRole'
    },
    selectRoleButtonInCollaboratorInformation: {
      selector: '//button[contains(@class, "files-collaborators-role-button")]',
      locateStrategy: 'xpath'
    },
    roleDropdownInCollaboratorInformation: {
      selector: '//div[contains(@id, "files-collaborators-roles-dropdown")]',
      locateStrategy: 'xpath'
    },
    roleButtonInDropdown: {
      // the translate bit is to make it case-insensitive
      selector: '//ul[contains(@class,"oc-autocomplete-suggestion-list")]//span[translate(.,"ABCDEFGHJIKLMNOPQRSTUVWXYZ","abcdefghjiklmnopqrstuvwxyz") ="%s"]',
      locateStrategy: 'xpath'
    },
    permissionCheckbox: {
      selector: '//label[@id="files-collaborators-permission-%s"]/input',
      locateStrategy: 'xpath'
    }
  }
}
