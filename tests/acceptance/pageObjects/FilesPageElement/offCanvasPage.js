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
    fileName: {
      selector:
        '//span[contains(@class, "file-row-name")]//span[.="%s"]/following-sibling::span[.="%s"]',
      locateStrategy: 'xpath'
    },
    mediaImage: {
      selector: '//div/img[@alt="%s"]',
      locateStrategy: 'xpath'
    }
  }
}
