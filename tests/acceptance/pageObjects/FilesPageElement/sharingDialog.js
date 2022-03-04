const util = require('util')
const _ = require('lodash')
const { COLLABORATOR_PERMISSION_ARRAY, calculateDate } = require('../../helpers/sharingHelper')
const { client } = require('nightwatch-api')
const userSettings = require('../../helpers/userSettings')
const collaboratorDialog = client.page.FilesPageElement.SharingDialog.collaboratorsDialog()
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
    getArrayFromPermissionString: function (permissions = ',') {
      permissions = permissions.replace(/\s/g, '')
      return permissions.split(',').filter((x) => x)
    },
    /**
     *
     * @param {string} permission
     */
    getPermissionCheckbox: function (permission) {
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
    getVisibleElementID: async function (using, value) {
      let visibleElementID = null
      await this.api.elements(using, value, (response) => {
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
      const removeCollaboratorBtnXpath =
        newCollaboratorXpath + this.elements.newCollaboratorRemoveButton.selector
      return this.useXpath().click(removeCollaboratorBtnXpath).useCss()
    },

    /**
     *
     * @param {string} userOrGroup
     * @param {string} userOrGroupName
     */
    isGroupNotPresentInSelectedCollaboratorsOptions: function (userOrGroup, userOrGroupName) {
      let requiredSelector
      if (userOrGroup === 'group') {
        requiredSelector = util.format(
          this.elements.groupInSelectedCollaboratorsList.selector,
          userOrGroupName
        )
      } else if (userOrGroup === 'user') {
        requiredSelector = util.format(
          this.elements.userInSelectedCollaboratorsList.selector,
          userOrGroupName
        )
      }
      return this.waitForElementNotVisible({
        selector: requiredSelector,
        locateStrategy: 'xpath'
      })
    },

    /**
     *
     * @param {string} receiver
     * @param {boolean} [shareWithGroup=false]
     * @param {boolean} remoteShare
     */
    selectCollaboratorForShare: async function (
      receiver,
      shareWithGroup = false,
      remoteShare = false
    ) {
      let sharee
      if (shareWithGroup === true) {
        sharee = receiver
      } else {
        sharee = client.globals.ocis
          ? await userSettings.getUsernameFromDisplayname(receiver)
          : receiver
      }

      if (remoteShare) sharee = util.format('%s@%s', receiver, this.api.globals.remote_backend_url)
      const autocompleteUser = client.globals.ocis ? receiver : sharee

      // We need waitForElementPresent here.
      // waitForElementVisible would break even with 'abortOnFailure: false' if the element is not present
      let failedOnFirstTry = false
      await this.enterAutoComplete(sharee)
      const dropdownElement = this.elements.sharingAutoCompleteDropDownElements
      await this.waitForElementVisible(
        dropdownElement.locateStrategy,
        dropdownElement.selector,
        this.api.globals.waitForConditionTimeout,
        this.api.globals.waitForConditionPollInterval,
        false,
        (result) => {
          failedOnFirstTry = result.status === -1
        }
      )
      if (failedOnFirstTry) {
        // sharing dropdown was not shown. Try a second time.
        console.log('WARNING: no sharing autocomplete dropdown found, retry typing')
        await this.clearValue('@sharingAutoComplete')
        await this.enterAutoComplete(sharee)
        await this.waitForElementVisible(dropdownElement.selector)
      }

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
     *
     * @param {string} sharee
     * @param {boolean} shareWithGroup
     * @param {string} role
     * @param {string} permissions
     * @param {boolean} remote
     * @param {string} days
     *
     * @return void
     */
    shareWithUserOrGroup: async function (
      sharee,
      shareWithGroup = false,
      role,
      permissions,
      remote = false,
      days
    ) {
      await this.selectCollaboratorForShare(sharee, shareWithGroup, remote)
      await this.changeCollaboratorRole('', role, permissions)

      if (days) {
        const dateToSet = calculateDate(days)
        const isExpiryDateChanged = await collaboratorDialog
          .expandExpirationDatePicker('')
          .setExpirationDate(dateToSet)
        if (!isExpiryDateChanged) {
          console.log('WARNING: Cannot create share with disabled expiration date!')
          return
        }
      }

      return this.confirmShare()
    },

    /**
     * Share a file with multiple users or groups. Submitting the share is optional.
     *
     * @param sharees { collaborator, type }[] list of sharees including their types (e.g. user or group)
     * @param role
     * @param permissions
     * @param submit
     * @returns {Promise<exports.commands>}
     */
    shareWithUsersOrGroups: async function (sharees, role, permissions, submit) {
      for (const { collaborator, type } of sharees) {
        await this.selectCollaboratorForShare(collaborator, type === 'group')
      }

      await this.changeCollaboratorRole('', role, permissions)

      if (submit) {
        await this.confirmShare()
      }

      return this
    },

    /**
     * Select a new role for new invite or existing share and apply provided permissions if the new role is custom permissions.
     *
     * @param collaborator { string } Empty string for new invite, collaborator name for existing shares.
     * @param role { string } role name
     * @param permissions { string } comma separated list of permission keys
     * @returns {Promise<void>}
     */
    changeCollaboratorRole: async function (collaborator = '', role, permissions) {
      if (role === 'Custom permissions') {
        await this.changeCustomPermissionsTo(collaborator, permissions)
      } else {
        await collaboratorDialog.expandShareRoleDropdown(collaborator)
        await this.selectRole(role)
      }
      return this
    },

    /**
     *
     * @param {String} role
     */
    selectRole: function (role) {
      role = _(role).chain().toLower().startCase().replace(/\s/g, '').value()
      return this.click(`@shareRole${role}`)
    },
    confirmShare: function () {
      return this.waitForElementPresent('@addShareSaveButton')
        .initAjaxCounters()
        .click('@addShareSaveButton')
        .waitForOutstandingAjaxCalls()
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
      for (let i = 0; i < COLLABORATOR_PERMISSION_ARRAY.length; i++) {
        const permissionCheckbox = this.getPermissionCheckbox(COLLABORATOR_PERMISSION_ARRAY[i])
        await this.api.element('xpath', permissionCheckbox, (result) => {
          if (!result.value.ELEMENT) {
            return
          }
          this.api.elementIdSelected(result.value.ELEMENT, (result) => {
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
    changeCustomPermissionsTo: async function (collaborator, requiredPermissions = ',') {
      await collaboratorDialog.expandShareRoleDropdown(collaborator)
      await this.selectRole('Custom permissions')

      const requiredPermissionsArray = this.getArrayFromPermissionString(requiredPermissions)
      const sharePermissions = await this.getSharePermissions()
      const sharePermissionsArray = Object.keys(sharePermissions).filter(
        (key) => sharePermissions[key]
      )

      for (const permission of COLLABORATOR_PERMISSION_ARRAY) {
        if (
          sharePermissionsArray.includes(permission) !==
          requiredPermissionsArray.includes(permission)
        ) {
          await this.toggleSinglePermission(permission)
        }
      }

      await this.click('@customPermissionsConfirmBtn')
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
     *
     * @param {string} collaborator
     */
    getDisplayedPermission: async function (collaborator) {
      await collaboratorDialog.expandShareRoleDropdown(collaborator)
      await this.selectRole('Custom permissions')
      // read the permissions from the checkboxes
      const currentSharePermissions = await this.getSharePermissions()

      // Hide role select dropdown
      this.moveToElement('@customPermissionsDrop', -9, 0)
      this.api.mouseButtonClick()
      this.waitForElementNotPresent('@customPermissionsDrop', 1000)
      return currentSharePermissions
    },
    /**
     *
     * @param {string} input
     */
    enterAutoComplete: async function (input) {
      await this.waitForElementVisible('@sharingAutoComplete')
      await this.initAjaxCounters()
      await this.setValueBySingleKeys('@sharingAutoComplete', input)
      await new Promise((resolve) => setTimeout(resolve, 250))
      await this.waitForAjaxCallsToStartAndFinish()
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
      const showAllResultsElement = this.elements.sharingAutoCompleteShowAllResultsButton
      // wait for autocomplete to finish loading
      await this.waitForElementVisible('@sharingAutoCompleteDropDown')
      await this.waitForElementNotPresent('@sharingAutoCompleteSpinner')
      // note: some result lists don't have the "show all" button depending on the number of entries,
      // so we only click it if present
      await this.api.element(
        showAllResultsElement.locateStrategy,
        showAllResultsElement.selector,
        (result) => {
          if (result.status !== -1) {
            return this.click('@sharingAutoCompleteShowAllResultsButton')
          }
        }
      )

      await this.api.elements(
        this.elements.sharingAutoCompleteDropDownElements.locateStrategy,
        this.elements.sharingAutoCompleteDropDownElements.selector,
        (result) => {
          result.value.forEach((value) => {
            webElementIdList.push(value[Object.keys(value)[0]])
          })
        }
      )
      return webElementIdList
    },

    /**
     * checks whether autocomplete list is visible
     *
     * @returns {Promise<boolean>}
     */
    isAutocompleteListVisible: async function () {
      let isVisible = false
      await this.api.elements('@sharingAutoCompleteDropDownElements', (result) => {
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
    assertUsersInAutocompleteList: function (usersMatchingPattern) {
      usersMatchingPattern.map((user) => {
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
    getCollaboratorInAutocompleteListSelector: function (collaborator, type) {
      return (
        util.format(this.elements.collaboratorAutocompleteItem.selector, type) +
        util.format(this.elements.collaboratorAutocompleteItemName.selector, collaborator)
      )
    },

    displayAllCollaboratorsAutocompleteResults: function () {
      return this.isVisible(
        {
          selector: '@sharingAutoCompleteShowAllResultsButton',
          timeout: this.api.globals.waitForNegativeConditionTimeout,
          suppressNotFoundErrors: true
        },
        (result) => {
          if (result.value === true) {
            this.click('@sharingAutoCompleteShowAllResultsButton')
          }
        }
      )
    },

    /**
     * Checks if the groups found in the autocomplete list consists of all the created groups whose name
     * matches with the pattern
     *
     * @param {string} groupMatchingPattern
     *
     */
    assertGroupsInAutocompleteList: function (groupMatchingPattern) {
      groupMatchingPattern.map((user) => {
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
    assertAlreadyExistingCollaboratorIsNotInAutocompleteList: function (name, type) {
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
    assertCollaboratorsInAutocompleteList: function (name, type, shouldBePresent = true) {
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
    changeCollaboratorExpiryDate: async function (collaborator, days) {
      await collaboratorDialog.expandShareEditDropdown(collaborator)
      const dateToSet = calculateDate(days)
      const isExpiryDateChanged = await collaboratorDialog
        .expandExpirationDatePicker(collaborator)
        .setExpirationDate(dateToSet)
      if (!isExpiryDateChanged) {
        console.log('WARNING: Cannot create share with disabled expiration date!')
      }
    },
    /**
     * extracts set value in expiration date field
     * @return {Promise<*>}
     */
    getExpirationDateFromInputField: async function () {
      let expirationDate
      await this.waitForElementVisible('@recipientDatepicker')
      await this.getAttribute('@recipientDatepicker', 'value', (result) => {
        const date = new Date(result.value)
        const dateString =
          date.getFullYear() +
          '-' +
          String(date.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(date.getDate()).padStart(2, '0') +
          ' 00:00:00'
        expirationDate = dateString
      })
      return expirationDate
    },
    /**
     *
     * @returns {Promise<string>}
     */
    getErrorMessage: async function () {
      let message
      await this.waitForElementVisible('@collaboratorErrorAlert').getText(
        'xpath',
        this.elements.collaboratorErrorAlert.selector,
        function (result) {
          message = result.value
        }
      )
      return message
    },
    /**
     *
     * @returns {boolean} Whether the message has been found
     */
    isSharePermissionMessageVisible: function () {
      return this.waitForElementVisible('@noResharePermissions')
    },
    /**
     *
     * @returns {boolean} Whether the message has been found
     */
    isLinkSharePermissionMessageVisible: function () {
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
      selector: '//p[@data-testid="files-collaborators-no-reshare-permissions-message"]',
      locateStrategy: 'xpath'
    },
    noReshareLinkPermissions: {
      selector: '//p[@data-testid="files-links-no-reshare-permissions-message"]',
      locateStrategy: 'xpath'
    },
    sharingAutoComplete: {
      selector: '#files-share-invite-input'
    },
    sharingAutoCompleteSpinner: {
      selector: '#new-collaborators-form .oc-spinner'
    },
    sharingAutoCompleteDropDown: {
      selector: '#new-collaborators-form .vs__dropdown-menu'
    },
    sharingAutoCompleteDropDownElements: {
      selector:
        '#new-collaborators-form .vs__dropdown-menu .files-collaborators-autocomplete-user-text'
    },
    sharingAutoCompleteShowAllResultsButton: {
      selector: '.oc-autocomplete-suggestion-overflow'
    },
    sharedWithListItem: {
      selector: '//*[@id="file-share-list"]//*[@class="oc-user"]//div[.="%s"]/../..',
      locateStrategy: 'xpath'
    },
    addShareSaveButton: {
      selector: '#new-collaborators-form-create-button'
    },
    shareRoleViewer: {
      selector: '#files-recipient-role-drop-btn-viewer'
    },
    shareRoleEditor: {
      selector: '#files-recipient-role-drop-btn-editor'
    },
    shareRoleCustomPermissions: {
      selector: '#files-recipient-role-drop-btn-custom'
    },
    newCollaboratorItems: {
      selector:
        "//p[@class='oc-recipient-name' and contains(., '%s')]/ancestor::span[contains(@class, 'files-share-invite-recipient')]"
    },
    newCollaboratorRemoveButton: {
      selector: "//button[contains(@class, 'files-share-invite-recipient-btn-remove')]"
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
    requiredLabelInCollaboratorsExpirationDate: {
      selector:
        '//label[@for="files-collaborators-collaborator-expiration-input" and contains(text(), "Expiration date (required)")]',
      locateStrategy: 'xpath'
    },
    elementInterceptingCollaboratorsExpirationInput: {
      selector: '.vdatetime-overlay.vdatetime-fade-leave-active.vdatetime-fade-leave-to'
    },
    customPermissionsConfirmBtn: {
      selector: '.files-recipient-custom-permissions-drop-cancel-confirm-btns .oc-button-primary'
    },
    customPermissionsCancelBtn: {
      selector: '.files-recipient-custom-permissions-drop-cancel-confirm-btns .oc-button-passive'
    },
    selectedRoleBtn: {
      selector: '.files-recipient-role-drop-btn.selected'
    },
    customPermissionsDrop: {
      selector: '.files-recipient-custom-permissions-drop'
    },
    groupInSelectedCollaboratorsList: {
      selector:
        '//span[contains(@class, "files-share-invite-recipient")]//span[.="Group"]/following-sibling::p[.="%s"]',
      locateStrategy: 'xpath'
    },
    userInSelectedCollaboratorsList: {
      selector:
        '//span[contains(@class, "files-share-invite-recipient")]//span[@data-test-user-name="%s"]/..',
      locateStrategy: 'xpath'
    },
    recipientDatepicker: {
      selector: '.files-recipient-expiration-datepicker'
    }
  }
}
