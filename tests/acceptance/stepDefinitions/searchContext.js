const { client } = require('nightwatch-api')
const { When } = require('@cucumber/cucumber')

When('the user searches for {string} using the webUI', async function (searchTerm) {
  await client.pause(500)
  await client.page.webPage().search(searchTerm)
})
