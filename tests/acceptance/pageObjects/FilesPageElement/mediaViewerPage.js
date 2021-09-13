const util = require('util')
const { client } = require('nightwatch-api')
const filesList = client.page.FilesPageElement.filesList()
const filesActionsMenu = client.page.FilesPageElement.fileActionsMenu()

module.exports = {
  commands: {
    openMediaViewer: async function(fileName) {
      await filesList.openFileActionsMenu(fileName)
      await filesActionsMenu.mediaViewer()

      return this
    },
    waitForMediaViewerLoaded: function(fileName) {
      const image = util.format(this.elements.mediaImage.selector, fileName)
      return this.useXpath()
        .waitForElementVisible(image)
        .useCss()
    },
    isMediaViewerPresent: async function() {
      let isPresent = false
      await this.useXpath().waitForElementVisible(
        {
          selector: this.elements.actionBar.selector,
          abortOnFailure: false
        },
        result => {
          isPresent = !!result.value
        }
      )
      return isPresent
    },
    nextMediaResource: function() {
      const nextButtonXpath = this.elements.actionBar.selector + this.elements.nextButton.selector
      return this.useXpath()
        .waitForElementVisible(nextButtonXpath)
        .waitForAnimationToFinish()
        .click(nextButtonXpath)
        .waitForAjaxCallsToStartAndFinish()
        .useCss()
    },
    previousMediaResource: function() {
      const previousButtonXpath =
        this.elements.actionBar.selector + this.elements.previousButton.selector
      return this.useXpath()
        .waitForElementVisible(previousButtonXpath)
        .click(previousButtonXpath)
        .waitForAjaxCallsToStartAndFinish()
        .useCss()
    },
    downloadMediaResource: function() {
      const downloadButtonXpath =
        this.elements.actionBar.selector + this.elements.downLoadButton.selector
      return this.useXpath()
        .waitForElementVisible(downloadButtonXpath)
        .click(downloadButtonXpath)
        .waitForAjaxCallsToStartAndFinish()
        .useCss()
    },
    closeMediaResource: function() {
      const closeButtonXpath = this.elements.actionBar.selector + this.elements.closeButton.selector
      return this.useXpath()
        .waitForElementVisible(closeButtonXpath)
        .click(closeButtonXpath)
        .waitForAjaxCallsToStartAndFinish()
        .useCss()
    }
  },
  elements: {
    actionBar: {
      selector: '//div[contains(@class, "media-viewer-controls-action-bar")]',
      locateStrategy: 'xpath'
    },
    nextButton: {
      selector: `//span[contains(@class, "media-viewer-controls-next")]`,
      locateStrategy: 'xpath'
    },
    previousButton: {
      selector: `//span[contains(@class, "media-viewer-controls-previous")]`,
      locateStrategy: 'xpath'
    },
    downLoadButton: {
      selector: `//span[contains(@class, "media-viewer-controls-download")]`,
      locateStrategy: 'xpath'
    },
    closeButton: {
      selector: `//span[contains(@class, "media-viewer-controls-close")]`,
      locateStrategy: 'xpath'
    },
    fileName: {
      selector:
        '//span[contains(@class, "file-row-name")]//span[.="%s"]/following-sibling::span[.="%s"]',
      locateStrategy: 'xpath'
    },
    mediaImage: {
      selector: '//div[contains(@class, "media-viewer-file-name") and contains(text(),"%s")]',
      locateStrategy: 'xpath'
    }
  }
}
