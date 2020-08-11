const util = require('util')

module.exports = {
  commands: {
    openMediaViewer: function() {
      return this.useXpath()
        .waitForElementVisible('@mediaviewer')
        .click('@mediaviewer')
        .waitForElementVisible('@actionBar')
        .useCss()
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
    mediaviewer: {
      selector: '//span[.="Mediaviewer"]',
      locateStrategy: 'xpath'
    },
    actionBar: {
      selector:
        '//div[@class = "uk-width-large uk-flex uk-flex-middle uk-flex-center uk-flex-around"]',
      locateStrategy: 'xpath'
    },
    nextButton: {
      selector: `//span[@aria-label="Next"]`,
      locateStrategy: 'xpath'
    },
    previousButton: {
      selector: `//span[@aria-label="Previous"]`,
      locateStrategy: 'xpath'
    },
    downLoadButton: {
      selector: `//span[@aria-label="Download"]`,
      locateStrategy: 'xpath'
    },
    closeButton: {
      selector: `//span[@aria-label="Close"]`,
      locateStrategy: 'xpath'
    },
    fileName: {
      selector:
        '//span[contains(@class, "file-row-name")]//span[.="%s"]/following-sibling::span[.="%s"]',
      locateStrategy: 'xpath'
    },
    mediaImage: {
      selector: '//div[contains(@class,"uk-position-bottom-center")]/div[contains(text(),"%s")]',
      locateStrategy: 'xpath'
    }
  }
}
