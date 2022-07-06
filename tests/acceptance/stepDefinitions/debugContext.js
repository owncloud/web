const { When } = require('@cucumber/cucumber')

When('pause for {int}', async function (duration) {
  await new Promise((resolve) => setTimeout(resolve, duration))
})
