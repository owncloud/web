const { client } = require('nightwatch-api')

module.exports = {
  navigateAndWaitTillLoaded: function (url, loadingIndicatorXpath) {
    client.url(url)
    client.refresh() // IE11 needs an extra refresh because of the hash in the url
    return client
      .waitForElementPresent({ selector: loadingIndicatorXpath, abortOnFailure: false }) // don't fail if we are too late
      .waitForElementNotPresent(loadingIndicatorXpath)
  }
}
