const { client } = require('nightwatch-api')
const { When } = require('@cucumber/cucumber')

When('the user searches for {string} using the webUI', function(searchTerm) {
  return client.page.webPage().search(searchTerm)
})

When('the user searches globally for {string} using the webUI', function(searchTerm) {
  return client.page.webPage().search(searchTerm, true)
})
