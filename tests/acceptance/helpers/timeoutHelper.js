const { client } = require('nightwatch-api')

module.exports = {
  parseTimeout: function (timeout) {
    if (timeout === null) {
      return client.globals.waitForConditionTimeout
    } else {
      return parseInt(timeout, 10)
    }
  }
}
