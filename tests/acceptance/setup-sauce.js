import { setDefaultTimeout, After, Before } from 'cucumber'
import { createSession, closeSession, startWebDriver, stopWebDriver } from 'nightwatch-api'
// import { SauceLabs } from 'saucelabs'

setDefaultTimeout(600000)

Before(async () => {
  await startWebDriver({ env: 'sauce' })
  await createSession({ env: 'sauce' })
})

After(async () => {
  await closeSession()
  await stopWebDriver()
})
