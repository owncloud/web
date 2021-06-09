const util = require('util')
const _ = require('lodash')
const { COLLABORATOR_PERMISSION_ARRAY, calculateDate } = require('../../helpers/sharingHelper')
const { client } = require('nightwatch-api')
const userSettings = require('../../helpers/userSettings')
const collaboratorDialog = client.page.FilesPageElement.SharingDialog.collaboratorsDialog()
const stringHelper = require('../../helpers/stringHelper')
const SHARE_TYPE_STRING = {
  user: 'user',
  group: 'group',
  federation: 'remote'
}

module.exports = {
  commands: {
    /**
     *
     * @param {string} permissions
     */
    getArrayFromPermissionString: function(permissions) {
      permissions = permissions.replace(/\s/g, '')
      return permissions.split(',').filter(x => x)
    },
    /**
     *
     * @param {string} permission
     */
    getPermissionCheckbox: function(permission) {
      return util.format(this.elements.permissionCheckbox.selector, permission)
    },
    /**
     * Return first elementID that matches given selector and is visible
     *
     * @param {string} using
     * @param {string} value
     *
     * @return {Promise<string|null>}
     */
    getVisibleElementID: async function(using, value) {
      let visibleElementID = null
      await this.api.elements(using, value, response => {
        for (const { ELEMENT } of response.value) {
          this.api.elementIdDisplayed(ELEMENT, function(result) {
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
    removePendingCollaboratorForShare: function(sharee) {
      const newCollaboratorXpath = util.format(this.elements.newCollaboratorItems.selector, sharee)
      const removeCollaboratorBtnXpath =
        newCollaboratorXpath + this.elements.newCollaboratorRemoveButton.selector

      return this.useXpath()
        .click(removeCollaboratorBtnXpath)
        .useCss()
    },

    /**
     *
     * @param {string} receiver
     * @param {boolean} [shareWithGroup=false]
     * @param {boolean} remoteShare
     */
    selectCollaboratorForShare: async function(
      receiver,
      shareWithGroup = false,
      remoteShare = false
    ) {
      let sharee
      if (shareWithGroup === true) {
        sharee = receiver
      } else {
        sharee = client.globals.ocis ? userSettings.getUsernameFromDisplayname(receiver) : receiver
      }

      if (remoteShare) sharee = util.format('%s@%s', receiver, this.api.globals.remote_backend_url)
      const autocompleteUser = client.globals.ocis ? receiver : sharee

      // We need waitForElementPresent here.
      // waitForElementVisible would break even with 'abortOnFailure: false' if the element is not present
      await this.enterAutoComplete(sharee).waitForElementPresent(
        {
          selector: '@sharingAutoCompleteDropDownElements',
          abortOnFailure: false
        },
        result => {
          if (result.value === false) {
            // sharing dropdown was not shown
            console.log('WARNING: no sharing autocomplete dropdown found, retry typing')
            this.clearValue('@sharingAutoComplete')
              .enterAutoComplete(sharee)
              .waitForElementVisible('@sharingAutoCompleteDropDownElements')
          }
        }
      )

      let receiverType = shareWithGroup === true ? SHARE_TYPE_STRING.group : SHARE_TYPE_STRING.user
      receiverType = remoteShare === true ? SHARE_TYPE_STRING.federation : receiverType

      const collaboratorSelector = this.getCollaboratorInAutocompleteListSelector(
        autocompleteUser,
        receiverType
      )

      await this.useXpath().click(collaboratorSelector)

      return this
    },

    /**
     * @param {string} permissions
     */
    selectPermissionsOnPendingShare: async function(permissions) {
      const permissionArray = this.getArrayFromPermissionString(permissions)
      for (const permission of permissionArray) {
        const permissionCheckbox = this.getPermissionCheckbox(permission)
        const elementID = await this.getVisibleElementID('xpath', permissionCheckbox)
        if (elementID === null) {
          throw new Error(`Checkbox is not visible for the permission '${permission}'`)
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
     * @param {boolean} remote
     * @param {string} days
     * @param {boolean} quickAction Asserts whether the quick actions should be used to open new collaborators panel
     *
     * @return void
     */
    shareWithUserOrGroup: async function(
      sharee,
      shareWithGroup = false,
      role,
      permissions,
      remote = false,
      days,
      quickAction = false
    ) {
      if (!quickAction) {
        await collaboratorDialog.clickCreateShare()
      }

      await this.selectCollaboratorForShare(sharee, shareWithGroup, remote)
      await this.selectRoleForNewCollaborator(role)

      if (permissions) {
        await this.selectPermissionsOnPendingShare(permissions)
      }

      if (days) {
        const dateToSet = calculateDate(days)
        const isExpiryDateChanged = await this.openExpirationDatePicker().setExpirationDate(
          dateToSet
        )
        if (!isExpiryDateChanged) {
          console.log('WARNING: Cannot create share with disabled expiration date!')
          return
        }
      }

      return this.confirmShare()
    },
    /**
     *
     * @param {String} role
     */
    selectRoleForNewCollaborator: function(role) {
      role = _(role)
        .chain()
        .toLower()
        .startCase()
        .replace(/\s/g, '')
        .value()
      return this.click('@newCollaboratorSelectRoleButton').click(`@newCollaboratorRole${role}`)
    },
    confirmShare: function() {
      return this.waitForElementPresent('@addShareSaveButton')
        .initAjaxCounters()
        .click('@addShareSaveButton')
        .waitForOutstandingAjaxCalls()
        .waitForElementNotPresent('@addShareSaveButton')
    },
    saveChanges: function() {
      return this.waitForElementVisible('@saveShareButton')
        .initAjaxCounters()
        .click('@saveShareButton')
        .waitForOutstandingAjaxCalls()
        .waitForElementNotPresent('@saveShareButton')
    },
    clickCancel: function() {
      return this.waitForElementVisible('@cancelButton').click('@cancelButton')
    },
    /**
     * Toggle the checkbox to set a certain permission for a share
     * Needs the collaborator information to be expanded
     *
     * @param {string} permission
     */
    toggleSinglePermission: async function(permission) {
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
    getSharePermissions: async function() {
      const permissions = {}
      const panelSelector = this.elements.sharingSidebarRoot.selector
      let permissionToggle
      for (let i = 0; i < COLLABORATOR_PERMISSION_ARRAY.length; i++) {
        permissionToggle =
          panelSelector +
          util.format(this.elements.permissionCheckbox.selector, COLLABORATOR_PERMISSION_ARRAY[i])

        await this.api.element('xpath', permissionToggle, result => {
          if (!result.value.ELEMENT) {
            return
          }
          this.api.elementIdSelected(result.value.ELEMENT, result => {
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
    changeCustomPermissionsTo: async function(collaborator, requiredPermissions) {
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
        await this.saveChanges()
      } else {
        await this.clickCancel()
      }
    },
    /**
     *
     * @param {string} collaborator
     * @param {string} permissions
     */
    getDisplayedPermission: async function(collaborator) {
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
    disableAllCustomPermissions: async function(collaborator) {
      await collaboratorDialog.clickEditShare(collaborator)
      const sharePermissions = await this.getSharePermissions(collaborator)
      const enabledPermissions = Object.keys(sharePermissions).filter(
        permission => sharePermissions[permission] === true
      )

      for (const permission of enabledPermissions) {
        await this.toggleSinglePermission(permission)
      }
      await this.saveChanges()
    },
    /**
     *
     * @param {string} input
     */
    enterAutoComplete: function(input) {
      return this.waitForElementVisible('@sharingAutoComplete')
        .initAjaxCounters()
        .setValueBySingleKeys('@sharingAutoComplete', input)
        .waitForAjaxCallsToStartAndFinish()
    },
    /**
     *
     * @returns {Promise.<string[]>} Array of autocomplete items
     */
    getShareAutocompleteItemsList: async function() {
      const webElementIdList = await this.getShareAutocompleteWebElementIdList()
      const itemsListPromises = webElementIdList.map(webElementId => {
        return new Promise((resolve, reject) => {
          this.api.elementIdText(webElementId, text => {
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
    getShareAutocompleteWebElementIdList: async function() {
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
      await this.api.element('css selector', showAllResultsXpath, result => {
        if (result.status !== -1) {
          return this.click('@sharingAutoCompleteShowAllResultsButton')
        }
      })

      await this.api.elements(
        'css selector',
        this.elements.sharingAutoCompleteDropDownElements.selector,
        result => {
          result.value.forEach(value => {
            webElementIdList.push(value[Object.keys(value)[0]])
          })
        }
      )
      return webElementIdList
    },
    /**
     *
     * @param {string} collaborator
     * @param {string} newRole
     * @returns {Promise}
     */
    changeCollaboratorRole: async function(collaborator, newRole) {
      await collaboratorDialog.clickEditShare(collaborator)
      await this.changeCollaboratorRoleInDropdown(newRole)
      return this.saveChanges()
    },
    /**
     * @params {string} newRole
     * @returns {Promise}
     */
    changeCollaboratorRoleInDropdown: function(newRole) {
      newRole = newRole === 'Advanced permissions' ? 'advancedRole' : newRole
      newRole = stringHelper.camelize(newRole)

      const newRoleButton = util.format(this.elements.roleButtonInDropdown.selector, newRole)
      return this.waitForElementVisible('@selectRoleButtonInCollaboratorInformation')
        .click('@selectRoleButtonInCollaboratorInformation')
        .useXpath()
        .waitForElementVisible(newRoleButton)
        .click(newRoleButton)
        .useCss()
    },
    /**
     * checks whether autocomplete list is visible
     *
     * @returns {Promise<boolean>}
     */
    isAutocompleteListVisible: async function() {
      let isVisible = false
      await this.api.elements('@sharingAutoCompleteDropDownElements', result => {
        isVisible = result.value.length > 0
      })
      return isVisible
    },

    /**
     * Checks if the users found in the autocomplete list consists of all the created users whose display name or userId
     * matches with the pattern
     *
     * @param {string} usersMatchingPattern
     *
     */
    assertUsersInAutocompleteList: function(usersMatchingPattern) {
      usersMatchingPattern.map(user => {
        const collaboratorSelector = this.getCollaboratorInAutocompleteListSelector(user, 'user')

        return this.useXpath().expect.element(collaboratorSelector).to.be.visible
      })

      return this
    },

    /**
     * Retures a xpath for the collaborator in the autocomplete list
     * @param {string} collaborator Name of the collaborator which should be found
     * @param {string} type Type of the collaborator which should be found
     * @returns {string} xpath of the collaborator
     */
    getCollaboratorInAutocompleteListSelector: function(collaborator, type) {
      return (
        util.format(this.elements.collaboratorAutocompleteItem.selector, type) +
        util.format(this.elements.collaboratorAutocompleteItemName.selector, collaborator)
      )
    },

    displayAllCollaboratorsAutocompleteResults: function() {
      return this.click('@sharingAutoCompleteShowAllResultsButton')
    },

    /**
     * Checks if the groups found in the autocomplete list consists of all the created groups whose name
     * matches with the pattern
     *
     * @param {string} groupMatchingPattern
     *
     */
    assertGroupsInAutocompleteList: function(groupMatchingPattern) {
      groupMatchingPattern.map(user => {
        const collaboratorSelector = this.getCollaboratorInAutocompleteListSelector(user, 'group')

        return this.useXpath().expect.element(collaboratorSelector).to.be.visible
      })

      return this
    },

    /**
     * Checks if the already existingCollaborator is not in the autocomplete list
     *
     * @param {string} name Name of the collaborator
     * @param {string} type Type of the collaborator. Can be either user, group or remote
     *
     */
    assertAlreadyExistingCollaboratorIsNotInAutocompleteList: function(name, type) {
      const collaboratorSelector = this.getCollaboratorInAutocompleteListSelector(name, type)

      return this.useXpath().expect.element(collaboratorSelector).to.not.be.present
    },

    /**
     * Checks if the collaborator is in the autocomplete list
     *
     * @param {string} name Name of the collaborator
     * @param {string} type Type of the collaborator. Can be either user, group or remote
     * @param {boolean} shouldBePresent Whether the collaborator should be found in the list or not
     *
     */
    assertCollaboratorsInAutocompleteList: function(name, type, shouldBePresent = true) {
      const collaboratorSelector = this.getCollaboratorInAutocompleteListSelector(name, type)

      if (shouldBePresent) {
        return this.useXpath().expect.element(collaboratorSelector).to.be.visible
      }

      return this.useXpath().expect.element(collaboratorSelector).to.not.be.present
    },
    /**
     * @param {string} collaborator Name of the collaborator
     * @param {string} days number of days to be added or subtracted from current date
     *
     * @return {Promise<*>}
     */
    changeCollaboratorExpiryDate: async function(collaborator, days) {
      await collaboratorDialog.clickEditShare(collaborator)
      const dateToSet = calculateDate(days)
      const isExpiryDateChanged = await this.openExpirationDatePicker().setExpirationDate(dateToSet)
      if (!isExpiryDateChanged) {
        console.log('WARNING: Cannot create share with disabled expiration date!')
        return
      }
      return this.saveChanges()
    },
    /**
     * opens expiration date field on the webUI
     * @return {*}
     */
    openExpirationDatePicker: function() {
      this.waitForElementVisible('@expirationDateField')
        .waitForElementNotPresent('@elementInterceptingCollaboratorsExpirationInput')
        .click('@expirationDateField')
      return client.page.FilesPageElement.expirationDatePicker()
    },
    /**
     * extracts set value in expiration date field
     * @return {Promise<*>}
     */
    getExpirationDateFromInputField: async function() {
      let expirationDate
      await this.waitForElementVisible('@expirationDateField').getValue(
        '@expirationDateField',
        result => {
          expirationDate = result.value
        }
      )
      return expirationDate
    },
    /**
     * gets disabled status of save share button
     * @return {Promise<*>}
     */
    getDisabledAttributeOfSaveShareButton: async function() {
      let disabled
      await this.waitForElementVisible('@saveShareButton').getAttribute(
        '@saveShareButton',
        'disabled',
        result => {
          disabled = result.value
        }
      )
      return disabled
    },
    /**
     * tries to change the settings of collaborator
     * @param {string} collaborator Name of the collaborator
     * @return {*}
     */
    changeCollaboratorSettings: async function(collaborator, editData) {
      await collaboratorDialog.clickEditShare(collaborator)
      for (const [key, value] of Object.entries(editData)) {
        await this.setCollaboratorForm(key, value)
      }
      return this.waitForElementVisible('@saveShareButton').click('@saveShareButton')
    },
    /**
     * function sets different fields for collaborator form
     *
     * @param key fields like permissionString, expireDate
     * @param value values for the different fields to be set
     * @returns {*|Promise<void>|exports}
     */
    setCollaboratorForm: function(key, value) {
      if (key === 'permissionString') {
        return this.changeCollaboratorRoleInDropdown(value)
      } else if (key === 'expireDate') {
        const dateToSet = calculateDate(value)
        return this.openExpirationDatePicker().setExpirationDate(dateToSet)
      }
      return this
    },
    /**
     *
     * @returns {Promise<string>}
     */
    getErrorMessage: async function() {
      let message
      await this.waitForElementVisible('@collaboratorErrorAlert').getText(
        'xpath',
        this.elements.collaboratorErrorAlert.selector,
        function(result) {
          message = result.value
        }
      )
      return message
    },
    /**
     *
     * @returns {boolean} Whether the message has been found
     */
    isSharePermissionMessageVisible: function() {
      return this.waitForElementVisible('@noResharePermissions')
    },
    /**
     *
     * @returns {boolean} Whether the message has been found
     */
    isLinkSharePermissionMessageVisible: function() {
      return this.waitForElementVisible('@noReshareLinkPermissions')
    }
  },
  elements: {
    collaboratorErrorAlert: {
      selector: '//div[contains(@class, "collaborator-error-alert")]',
      locateStrategy: 'xpath'
    },
    sharingSidebarRoot: {
      selector: '//*[@id="oc-files-sharing-sidebar"]',
      locateStrategy: 'xpath'
    },
    noResharePermissions: {
      selector: '//p[@data-test-id="files-collaborators-no-reshare-permissions-message"]',
      locateStrategy: 'xpath'
    },
    noReshareLinkPermissions: {
      selector: '//p[@data-test-id="files-links-no-reshare-permissions-message"]',
      locateStrategy: 'xpath'
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
      selector:
        '#oc-sharing-autocomplete .oc-autocomplete-suggestion .files-collaborators-autocomplete-user-text'
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
    newCollaboratorRoleViewer: {
      selector: '#files-role-viewer'
    },
    newCollaboratorRoleEditor: {
      selector: '#files-role-editor'
    },
    newCollaboratorItems: {
      selector:
        "//span[contains(@class, 'files-collaborators-autocomplete-username') and contains(., '%s')]/ancestor::li[contains(@class, 'files-collaborators-collaborator-autocomplete-item')]"
    },
    newCollaboratorRemoveButton: {
      selector:
        "//button[contains(@class, 'files-collaborators-collaborator-autocomplete-item-remove')]"
    },
    newCollaboratorRoleAdvancedPermissions: {
      selector: '#files-role-advancedRole'
    },
    selectRoleButtonInCollaboratorInformation: {
      selector: '#files-collaborators-role-button'
    },
    roleDropdownInCollaboratorInformation: {
      selector: '//div[contains(@id, "files-collaborators-roles-dropdown")]',
      locateStrategy: 'xpath'
    },
    roleButtonInDropdown: {
      // the translate bit is to make it case-insensitive
      selector: '//span[@id="files-role-%s"]',
      locateStrategy: 'xpath'
    },
    permissionCheckbox: {
      selector: '//input[@id="files-collaborators-permission-%s"]',
      locateStrategy: 'xpath'
    },
    collaboratorExpirationDateInput: {
      selector: '#files-collaborators-collaborator-expiration-input'
    },
    collaboratorExpirationDateModalNextMonthButton: {
      selector: '.vdatetime-calendar__navigation--next'
    },
    collaboratorExpirationDateModalDay: {
      selector: '//div[contains(@class, "vdatetime-calendar__month__day")]/span/span[text()="%s"]',
      locateStrategy: 'xpath'
    },
    collaboratorExpirationDateModalConfirmButton: {
      selector: '.vdatetime-popup__actions__button--confirm'
    },
    collaboratorExpirationDate: {
      selector:
        '//p[contains(@class, "files-collaborators-collaborator-name") and text()="%s"]/../..//span[contains(@class, "files-collaborators-collaborator-expires")]',
      locateStrategy: 'xpath'
    },
    collaboratorAutocompleteItem: {
      selector: '//div[contains(@class, "files-collaborators-search-%s")]',
      locateStrategy: 'xpath'
    },
    collaboratorAutocompleteItemName: {
      selector:
        '//div[contains(@class, "files-collaborators-autocomplete-user-text")]/span[contains(@class, "files-collaborators-autocomplete-username") and text()="%s"]',
      locateStrategy: 'xpath'
    },
    collaboratorsListItemInfo: {
      selector: '//div[contains(@class, "files-collaborators-collaborator-info-%s")]',
      locateStrategy: 'xpath'
    },
    collaboratorsListItemName: {
      selector: '//span[contains(@class, "files-collaborators-collaborator-name") and text()="%s"]',
      locateStrategy: 'xpath'
    },
    expirationDateField: {
      selector: '.vdatetime-input'
    },
    requiredLabelInCollaboratorsExpirationDate: {
      selector:
        '//label[@for="files-collaborators-collaborator-expiration-input"]/em[.="(required)"]',
      locateStrategy: 'xpath'
    },
    elementInterceptingCollaboratorsExpirationInput: {
      selector: '.vdatetime-overlay.vdatetime-fade-leave-active.vdatetime-fade-leave-to'
    }
  }
}
