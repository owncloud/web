const { client } = require('nightwatch-api')
const { When } = require('cucumber')

When('the user closes the message', function() {
  return client.page.webPage().closeMessage()
})
