const util = require('util')

module.exports = {
  commands: {
    /**
     *
     * @returns {Promise.<string[]>} Array of autocomplete webElementIds
     */
    deleteShareWithUserGroup: function (item) {
      const informationSelector = util.format(this.elements.collaboratorInformationByCollaboratorName.selector, item)
      const deleteSelector = informationSelector + this.elements.deleteShareButton.selector
      return this
        .useXpath()
        .waitForElementVisible(deleteSelector)
        .waitForAnimationToFinish()
        .click(deleteSelector)
        .waitForElementNotPresent(informationSelector)
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
    }
  }
}
