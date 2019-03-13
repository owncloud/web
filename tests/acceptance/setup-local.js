import { setDefaultTimeout, After, Before } from 'cucumber'
import { createSession, closeSession, startWebDriver, stopWebDriver } from 'nightwatch-api'

setDefaultTimeout(60000)

Before(async () => {
  await startWebDriver({ env: 'local' })
  await createSession({ env: 'local' })
  console.log("Before scenario")
})

After(async () => {
  await closeSession()
  await stopWebDriver()
  console.log("After scenario")
})
