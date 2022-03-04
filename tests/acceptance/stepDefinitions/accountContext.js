const { client } = require('nightwatch-api')
const { When } = require('@cucumber/cucumber')

When('the user browses to the account page', function () {
  return client.page.accountPage().navigateAndWaitTillLoaded()
})
