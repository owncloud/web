const { join } = require('../helpers/path')

module.exports = {
  url: function () {
    return join(this.api.launchUrl, '/files/shares/with-others/')
  },
  commands: {
    /**
     * like build-in navigate() but also waits till for the progressbar to appear and disappear
     * @returns {*}
     */
    navigateAndWaitTillLoaded: function () {
      return this.navigate(this.url()).waitForElementPresent(
        this.page.FilesPageElement.filesList().elements.anyAfterLoading
      )
    },
    getCollaboratorsForResource: async function (fileName) {
      const collaborators = []
      const requiredXpath =
        this.api.page.FilesPageElement.filesList().getFileRowSelectorByFileName(fileName) +
        this.elements.collaboratorsInFileRow.selector
      await this.waitForElementVisible({
        locateStrategy: this.elements.collaboratorsInFileRow.locateStrategy,
        selector: requiredXpath
      })
      await this.api.elements(
        this.elements.collaboratorsInFileRow.locateStrategy,
        requiredXpath,
        (elements) => {
          elements.value.forEach((el) => {
            ;['data-test-user-name', 'data-test-link-name', 'data-test-item-name'].forEach(
              (attr) => {
                this.api.elementIdAttribute(el.ELEMENT, attr, (r) => {
                  collaborators.push(r.value)
                })
              }
            )
          })
        }
      )
      return collaborators
    }
  },
  elements: {
    collaboratorsInFileRow: {
      selector:
        '//span[contains(@class, "resource-table-people")]/span[contains(@class, "oc-avatars")]/span[contains(@class, "oc-avatar")]',
      locateStrategy: 'xpath'
    }
  }
}
