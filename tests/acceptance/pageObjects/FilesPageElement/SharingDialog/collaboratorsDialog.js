const util = require('util')

module.exports = {
  commands: {
    /**
     * @param {string} collaborator
     * @returns {Promise.<string[]>} Array of autocomplete webElementIds
     */
    deleteShareWithUserGroup: function (collaborator) {
      const informationSelector = util.format(
        this.elements.collaboratorInformationByCollaboratorName.selector,
        collaborator
      )
      const dropDown = informationSelector + this.elements.editDropdown.selector
      const deleteSelector = this.elements.deleteShareButton.selector

      return this.useXpath()
        .waitForElementVisible(dropDown)
        .waitForAnimationToFinish() // wait for animation of share sliding out
        .click(dropDown)
        .waitForElementVisible(deleteSelector)
        .waitForAnimationToFinish() // wait for animation of share sliding out
        .click(deleteSelector)
        .waitForElementNotPresent(informationSelector)
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
    /**
     *
     * @param {Object.<String,Object>} subSelectors Map of arbitrary attribute name to selector to query
     * inside the collaborator element, defaults to all when null
     * @param filterDisplayName
     * @param timeout
     * @returns {Promise.<string[]>} Array of users/groups in share list
     */
    getCollaboratorsList: async function (
      subSelectors = null,
      filterDisplayName = null,
      timeout = null
    ) {
      let results = []
      // FIXME: filtering broken? probably will fail in other tests...
      // let informationSelector = {
      //   selector: '@collaboratorsInformation'
      // }
      // timeout = timeoutHelper.parseTimeout(timeout)
      // if (filterDisplayName !== null) {
      // informationSelector = {
      //   selector: util.format(
      //     this.elements.collaboratorInformationByCollaboratorName.selector,
      //     filterDisplayName
      //   ),
      //   locateStrategy: this.elements.collaboratorInformationByCollaboratorName.locateStrategy,
      //   timeout: timeout
      // }
      // }

      if (subSelectors === null) {
        subSelectors = {
          displayName: this.elements.collaboratorInformationSubName,
          role: this.elements.collaboratorInformationSubRole,
          additionalInfo: this.elements.collaboratorInformationSubAdditionalInfo,
          shareType: this.elements.collaboratorShareType
        }
      }

      let collaboratorsElementIds = null
      await this.waitForElementPresent('@collaboratorsList').api.elements(
        'css selector',
        this.elements.collaboratorsInformation,
        (result) => {
          collaboratorsElementIds = result.value.map((item) => item[Object.keys(item)[0]])
        }
      )

      results = collaboratorsElementIds.map(async (collaboratorElementId) => {
        const collaboratorResult = {}
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

        return collaboratorResult
      })

      results = await Promise.all(results)
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
        '//span[contains(@class, "collaborator-display-name") and contains(text(),"%s")]/ancestor::div[contains(@class, "files-collaborators-collaborator")]',
      locateStrategy: 'xpath'
    },
    deleteShareButton: {
      // within collaboratorInformationByCollaboratorName
      selector: '//button[contains(@class, "remove-share")]',
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
      selector: '#files-collaborators-list'
    },
    collaboratorsInformation: {
      // addresses users and groups
      selector: '.files-collaborators-collaborator'
    },
    collaboratorInformationSubName: {
      // within collaboratorsInformation
      selector: '.collaborator-display-name'
    },
    collaboratorInformationSubRole: {
      // within collaboratorsInformation
      selector: '.files-recipient-role-select-btn:first-child'
    },
    collaboratorInformationSubAdditionalInfo: {
      // within collaboratorsInformation
      selector: '.collaborator-additional-info'
    },
    collaboratorShareType: {
      selector: '.share-type'
    },
    collaboratorExpirationInfo: {
      selector:
        '//p[contains(@class, "files-collaborators-collaborator-name") and text()="%s"]/../..//span[contains(@class, "files-collaborators-collaborator-expires")]',
      locateStrategy: 'xpath'
    }
  }
}
