const util = require('util')

module.exports = {
  commands: {
    /**
     * @param collaborator
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
    }
  }
}
