const { client } = require('nightwatch-api')
const { Then } = require('cucumber')

Then('the error message {string} should be displayed on the webUI', function (folder) {
  return client
    .page.phoenixPage()
    .waitForElementVisible('@message')
    .expect.element('@message').text.to.equal(folder)
})
