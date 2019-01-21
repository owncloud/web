import { setDefaultTimeout, AfterAll, BeforeAll } from 'cucumber'
import { createSession, closeSession, startWebDriver, stopWebDriver } from 'nightwatch-api'

setDefaultTimeout(60000)

BeforeAll(async () => {
  await startWebDriver({ env: 'local' })
  await createSession({ env: 'local' })
})

AfterAll(async () => {
  await closeSession()
  await stopWebDriver()
})
