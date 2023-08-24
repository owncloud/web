const util = require('util')
const timeoutHelper = require('../../../helpers/timeoutHelper')
const { client } = require('nightwatch-api')

module.exports = {
  commands: {
    /**
     * @param {string} collaborator
     * @returns {Promise.<string[]>} Array of autocomplete webElementIds
     */
    deleteShareWithUserGroup: function (collaborator) {
      this.expandShareEditDropdown(collaborator)
      const deleteSelector = this.elements.deleteShareButton.selector
      const dialogSelector = this.elements.dialog.selector
      const dialogConfirmSelector = this.elements.dialogConfirmBtn.selector

      return this.useXpath()
        .waitForElementVisible(deleteSelector)
        .waitForAnimationToFinish() // wait for animation of share sliding out
        .click(deleteSelector)
        .waitForElementVisible(dialogSelector)
        .waitForAnimationToFinish() // wait for transition on the modal to finish
        .click(dialogConfirmSelector)
        .waitForAjaxCallsToStartAndFinish()
        .waitForElementNotPresent('@collaboratorEditDropDownList')
    },
    /**
     * Open the role selection dialog for a new share or for editing the given collaborator
     *
     * @param {string | null} collaborator
     */
    expandShareRoleDropdown: function (collaborator = null) {
      if (!collaborator) {
        return this.waitForElementVisible('@newShareRoleButton').click('@newShareRoleButton')
      }

      const informationSelector = util.format(
        this.elements.collaboratorInformationByCollaboratorName.selector,
        collaborator
      )
      const editRoleSelector = informationSelector + this.elements.editShareRoleButton.selector
      return this.useXpath().waitForElementVisible(editRoleSelector).click(editRoleSelector)
    },
    expandShareEditDropdown: function (collaborator) {
      const informationSelector = util.format(
        this.elements.collaboratorInformationByCollaboratorName.selector,
        collaborator
      )
      const editDropdownSelector = informationSelector + this.elements.editDropdown.selector
      return this.useXpath().waitForElementVisible(editDropdownSelector).click(editDropdownSelector)
    },
    expandExpirationDatePicker: function (collaborator) {
      if (!collaborator) {
        this.waitForElementVisible('@threeDotsTrigger').click('@threeDotsTrigger')
        this.waitForElementVisible('@setExpirationDateButton').click('@setExpirationDateButton')
        return client.page.FilesPageElement.expirationDatePicker()
      }
      const informationSelector = util.format(
        this.elements.collaboratorInformationByCollaboratorName.selector,
        collaborator
      )
      const editExpirationSelector =
        informationSelector + this.elements.expirationDatePickerTrigger.selector
      this.useXpath().waitForElementVisible(editExpirationSelector).click(editExpirationSelector)
      return client.page.FilesPageElement.expirationDatePicker()
    },
    hasCollaboratorsList: async function (expectCollaborator = true) {
      let isVisible = false
      const element = this.elements.collaboratorsList

      const timeout = expectCollaborator
        ? this.api.globals.waitForConditionTimeout
        : this.api.globals.waitForNegativeConditionTimeout

      await this.isVisible(
        {
          locateStrategy: element.locateStrategy,
          selector: element.selector,
          timeout: timeoutHelper.parseTimeout(timeout),
          suppressNotFoundErrors: !expectCollaborator
        },
        (result) => {
          isVisible = result.value === true
        }
      )
      return isVisible
    },
    /**
     *
     * @param {Object.<String,Object>} subSelectors Map of arbitrary attribute name to selector to query
     * inside the collaborator element, defaults to all when null
     * @param filterDisplayName Instead of reading the full list of sharees, only grab the one sharee that matches the given display name
     * @param timeout
     * @returns {Promise.<string[]>} Array of users/groups in share list
     */
    getCollaboratorsList: async function (
      subSelectors = null,
      filterDisplayName = null,
      timeout = null
    ) {
      const results = []

      let listItemSelector = {
        selector: this.elements.collaboratorsListItem.selector
      }
      timeout = timeoutHelper.parseTimeout(timeout)
      if (filterDisplayName !== null) {
        listItemSelector = {
          selector: util.format(
            this.elements.collaboratorInformationByCollaboratorName.selector,
            filterDisplayName
          ),
          locateStrategy: this.elements.collaboratorInformationByCollaboratorName.locateStrategy,
          timeout
        }
      }

      if (subSelectors === null) {
        subSelectors = {
          displayName: this.elements.collaboratorInformationSubName,
          role: this.elements.collaboratorInformationSubRole,
          additionalInfo: this.elements.collaboratorInformationSubAdditionalInfo,
          shareType: this.elements.collaboratorShareType
        }
      }

      let listItemElementIds = []
      await this.waitForElementPresent('@collaboratorsList').api.elements(
        'css selector',
        listItemSelector,
        (result) => {
          if (result.status === -1) {
            return
          }
          listItemElementIds = listItemElementIds.concat(
            result.value.map((item) => item[Object.keys(item)[0]])
          )
        }
      )
      for (const collaboratorElementId of listItemElementIds) {
        const collaboratorResult = {}

        let collaboratorEditButton = null
        await this.api.elementIdElement(
          collaboratorElementId,
          'css selector',
          this.elements.collaboratorEditButton,
          (result) => {
            collaboratorEditButton = result.value.ELEMENT
          }
        )
        await this.api.elementIdClick(collaboratorEditButton)

        let accessDetailsBtn = null
        await this.api.elementIdElement(
          collaboratorElementId,
          'css selector',
          this.elements.collaboratorAccessDetailsButton,
          (result) => {
            accessDetailsBtn = result.value.ELEMENT
          }
        )
        await this.api.elementIdClick(accessDetailsBtn)
        this.waitForElementVisible(this.elements.collaboratorAccessDetailsDrop)

        for (const attrName in subSelectors) {
          let attrElementId = null
          await this.api.elementIdElement(
            collaboratorElementId,
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
              collaboratorResult[attrName] = text.value
            })
          } else {
            collaboratorResult[attrName] = false
          }
        }
        results.push(collaboratorResult)
        let collaboratorAvatarElId = null
        await this.api.elementIdElement(
          collaboratorElementId,
          'css selector',
          '.files-collaborators-collaborator-indicator',
          (result) => {
            collaboratorAvatarElId = result.value.ELEMENT
          }
        )
        // to hide the access details dialog from the screen, click on the collaborator avatar
        await this.api.elementIdClick(collaboratorAvatarElId)
        await this.waitForElementNotPresent(
          '@collaboratorAccessDetailsDrop',
          this.api.globals.waitForConditionTimeout
        )
      }

      return results
    },
    /**
     *
     * @returns {Promise.<string[]>} Array of user/group display names in share list
     */
    getCollaboratorsListNames: async function () {
      const list = await this.getCollaboratorsList({
        name: this.elements.collaboratorInformationSubName
      })
      return list.map((result) => result.name)
    },
    /**
     * check if the expiration date is present in the collaborator share and then get the expiration information
     * @return {Promise.<string>}
     */
    getCollaboratorExpirationInfo: async function (user) {
      let text
      const formattedWithUserName = util.format(
        this.elements.collaboratorExpirationInfo.selector,
        user
      )
      const formattedCollaboratorInfoByCollaboratorName = util.format(
        this.elements.collaboratorInformationByCollaboratorName.selector,
        user
      )
      await this.useXpath()
        .waitForElementVisible(formattedCollaboratorInfoByCollaboratorName)
        .getText('xpath', formattedWithUserName, function (result) {
          if (typeof result.value === 'string') {
            text = result.value
          }
        })
      return text
    }
  },
  elements: {
    collaboratorInformationByCollaboratorName: {
      selector:
        '//span[contains(@class, "files-collaborators-collaborator-name") and contains(text(),"%s")]/ancestor::li',
      locateStrategy: 'xpath'
    },
    deleteShareButton: {
      // within collaboratorInformationByCollaboratorName
      selector: '//button[contains(@class, "remove-share")]',
      locateStrategy: 'xpath'
    },
    dialog: {
      selector: '//div[contains(@class, "oc-modal")]',
      locateStrategy: 'xpath'
    },
    dialogConfirmBtn: {
      selector: '//button[contains(@class, "oc-modal-body-actions-confirm")]',
      locateStrategy: 'xpath'
    },
    createShareDialog: {
      selector: '#new-collaborators-form'
    },
    newShareRoleButton: {
      selector: '#files-collaborators-role-button-new'
    },
    editShareRoleButton: {
      // within collaboratorInformationByCollaboratorName
      selector: '//button[contains(@class, "files-recipient-role-select-btn")]',
      locateStrategy: 'xpath'
    },
    editDropdown: {
      // within collaboratorInformationByCollaboratorName
      selector: '//button[contains(@class, "collaborator-edit-dropdown-options-btn")]',
      locateStrategy: 'xpath'
    },
    editShareDialog: {
      selector: '//*[contains(@class, "files-collaborators-collaborator-edit-dialog")]',
      locateStrategy: 'xpath'
    },
    collaboratorsList: {
      // container around collaborator list items
      selector: '#files-collaborators-list',
      locateStrategy: 'css selector'
    },
    collaboratorsListItem: {
      // addresses users and groups
      selector: '.files-collaborators-collaborator'
    },
    collaboratorInformationSubName: {
      // within collaboratorsListItem
      selector: '.files-collaborators-collaborator-name'
    },
    collaboratorInformationSubRole: {
      // within collaboratorsListItem
      selector: '.files-recipient-role-select-btn:first-child'
    },
    collaboratorInformationSubAdditionalInfo: {
      // within collaboratorsListItem
      selector:
        '//div[contains(@class, "share-access-details-drop")]//dt[contains(text(),"Additional info")]/following-sibling::dd[1]',
      locateStrategy: 'xpath'
    },
    collaboratorShareType: {
      selector:
        '//div[contains(@class, "share-access-details-drop")]//dt[contains(text(),"Type")]/following-sibling::dd[1]',
      locateStrategy: 'xpath'
    },
    collaboratorExpirationInfo: {
      selector:
        '//p[contains(@class, "files-collaborators-collaborator-name") and text()="%s"]/../..//span[contains(@class, "files-collaborators-collaborator-expires")]',
      locateStrategy: 'xpath'
    },
    threeDotsTrigger: {
      selector: 'button#show-more-share-options-btn'
    },
    setExpirationDateButton: {
      selector: '.files-recipient-expiration-datepicker'
    },
    expirationDatePickerTrigger: {
      selector: '//button[contains(@class, "files-collaborators-expiration-button")]',
      locateStrategy: 'xpath'
    },
    collaboratorEditButton: {
      selector: '.collaborator-edit-dropdown-options-btn'
    },
    collaboratorAccessDetailsButton: {
      selector: '.show-access-details'
    },
    collaboratorAccessDetailsDrop: {
      selector: '.share-access-details-drop'
    },
    collaboratorEditDropDownList: {
      selector: '.collaborator-edit-dropdown-options-list'
    }
  }
}
