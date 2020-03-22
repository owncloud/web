const { client } = require('nightwatch-api')

module.exports = {
  /**
   * @param {string} url
   * @param {object} loadingIndicatorSelector - object that can have properties {selector [,locateStrategy]}
   */
  navigateAndWaitTillLoaded: function(url, loadingIndicatorSelector) {
    client.url(url)
    client.refresh() // IE11 needs an extra refresh because of the hash in the url
    const locator = {}
    if (typeof loadingIndicatorSelector === 'object') {
      locator.selector = loadingIndicatorSelector.selector
      locator.locateStrategy = loadingIndicatorSelector.locateStrategy || 'css selector' // assume the locateStrategy to be 'css selector' if not given
    } else {
      throw new Error('Invalid type for loading indicator selector')
    }
    return client
      .waitForElementPresent({ ...locator, abortOnFailure: false }) // don't fail if we are too late
      .waitForElementNotPresent(locator)
  }
}
