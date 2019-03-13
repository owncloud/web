import { setDefaultTimeout, After, Before } from 'cucumber'
import { createSession, closeSession, startWebDriver, stopWebDriver } from 'nightwatch-api'

setDefaultTimeout(60000)

Before(async () => {
  await startWebDriver({ env: 'local' })
  await createSession({ env: 'local' })
})

After(async () => {
  await closeSession()
  await stopWebDriver()
})
