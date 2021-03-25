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
      throw new Error(
        'Invalid type for loading indicator selector with selector=' + loadingIndicatorSelector
      )
    }
    return client
      .waitForElementPresent({
        ...locator,
        abortOnFailure: false, // don't fail if we are too late
        timeout: client.globals.waitForNegativeConditionTimeout
      })
      .waitForElementNotPresent(locator)
  },

  /**
   * @param {string} url
   * @param {object} ElementSelector - object that can have properties {selector [,locateStrategy]}
   */
  navigateAndWaitTillElementPresent: function(url, ElementSelector) {
    client.url(url)
    client.refresh() // IE11 needs an extra refresh because of the hash in the url
    const locator = {}
    if (typeof ElementSelector === 'object') {
      locator.selector = ElementSelector.selector
      locator.locateStrategy = ElementSelector.locateStrategy || 'css selector' // assume the locateStrategy to be 'css selector' if not given
    } else {
      throw new Error('Invalid type for element selector')
    }
    return client.waitForElementPresent({
      ...locator,
      abortOnFailure: false, // don't fail if we are too late
      timeout: client.globals.waitForConditionTimeout
    })
  }
}
