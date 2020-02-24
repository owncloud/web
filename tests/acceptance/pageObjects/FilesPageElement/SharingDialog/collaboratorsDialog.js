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
      const deleteSelector = informationSelector + this.elements.deleteShareButton.selector
      return this
        .useXpath()
        .waitForElementVisible(deleteSelector)
        .waitForAnimationToFinish()
        .click(deleteSelector)
        .waitForElementNotPresent(informationSelector)
    },
    /**
     * Clicks the button to add a new collaborator
     */
    clickCreateShare: function () {
      return this
        .initAjaxCounters()
        .useXpath()
        .waitForElementVisible('@createShareButton')
        .click('@createShareButton')
        .waitForOutstandingAjaxCalls()
        .waitForElementVisible('@createShareDialog')
        .waitForAnimationToFinish()
        .useCss()
    },
    /**
     *
     * @param {string} collaborator
     */
    clickEditShare: function (collaborator) {
      const informationSelector = util.format(
        this.elements.collaboratorInformationByCollaboratorName.selector,
        collaborator
      )
      const editSelector = informationSelector + this.elements.editShareButton.selector
      return this
        .useXpath()
        .waitForElementVisible(editSelector)
        .click(editSelector)
        .waitForElementVisible('@editShareDialog')
        .useCss()
    },
    /**
     *
     * @param {Object.<String,Object>} subSelectors Map of arbitrary attribute name to selector to query
     * inside the collaborator element, defaults to all when null
     * @returns {Promise.<string[]>} Array of users/groups in share list
     */
    getCollaboratorsList: async function (subSelectors = null, filterDisplayName = null) {
      let results = []
      let informationSelector = {
        selector: '@collaboratorsInformation',
        abortOnFailure: false
      }
      if (filterDisplayName !== null) {
        informationSelector = {
          selector: util.format(this.elements.collaboratorInformationByCollaboratorName.selector, filterDisplayName),
          locateStrategy: this.elements.collaboratorInformationByCollaboratorName.locateStrategy,
          abortOnFailure: false
        }
      }

      if (subSelectors === null) {
        subSelectors = {
          displayName: this.elements.collaboratorInformationSubName,
          role: this.elements.collaboratorInformationSubRole,
          shareType: this.elements.collaboratorInformationSubShareType,
          additionalInfo: this.elements.collaboratorInformationSubAdditionalInfo,
          viaLabel: this.elements.collaboratorInformationSubVia,
          resharer: this.elements.collaboratorInformationSubResharer
        }
      }

      let collaboratorsElementIds = null
      await this.initAjaxCounters()
        .waitForElementPresent(informationSelector)
        .waitForOutstandingAjaxCalls()
        .api.elements('css selector', this.elements.collaboratorsInformation, result => {
          collaboratorsElementIds = result.value.map(item => item[Object.keys(item)[0]])
        })

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
      return list.map(result => result.name)
    }
  },
  elements: {
    collaboratorInformationByCollaboratorName: {
      selector: '//*[contains(@class, "files-collaborators-collaborator-name") and .="%s"]/ancestor::*[contains(concat(" ", @class, " "), " files-collaborators-collaborator ")]',
      locateStrategy: 'xpath'
    },
    deleteShareButton: {
      // within collaboratorInformationByCollaboratorName
      selector: '//*[contains(@class, "files-collaborators-collaborator-delete")]',
      locateStrategy: 'xpath'
    },
    createShareButton: {
      selector: '//*[contains(@class, "files-collaborators-open-add-share-dialog-button")]',
      locateStrategy: 'xpath'
    },
    createShareDialog: {
      selector: '//*[contains(@class, "files-collaborators-collaborator-add-dialog")]',
      locateStrategy: 'xpath'
    },
    editShareButton: {
      // within collaboratorInformationByCollaboratorName
      selector: '//*[contains(@class, "files-collaborators-collaborator-edit")]',
      locateStrategy: 'xpath'
    },
    editShareDialog: {
      selector: '//*[contains(@class, "files-collaborators-collaborator-edit-dialog")]',
      locateStrategy: 'xpath'
    },
    collaboratorsInformation: {
      // addresses users and groups
      selector: '.files-collaborators-collaborator'
    },
    collaboratorInformationSubName: {
      // within collaboratorsInformation
      selector: '.files-collaborators-collaborator-name'
    },
    collaboratorInformationSubRole: {
      // within collaboratorsInformation
      selector: '.files-collaborators-collaborator-role'
    },
    collaboratorInformationSubShareType: {
      // within collaboratorsInformation
      selector: '.files-collaborators-collaborator-share-type'
    },
    collaboratorInformationSubAdditionalInfo: {
      // within collaboratorsInformation
      selector: '.files-collaborators-collaborator-additional-info'
    },
    collaboratorInformationSubVia: {
      // within collaboratorsInformation
      selector: '.files-collaborators-collaborator-via-label'
    },
    collaboratorInformationSubResharer: {
      // within collaboratorsInformation
      selector: '.files-collaborators-collaborator-reshare-information'
    }
  }
}
