import { setDefaultTimeout, After, Before } from 'cucumber'
import { createSession, closeSession, startWebDriver, stopWebDriver, client } from 'nightwatch-api'
import { rollbackConfigs, setConfigs, cacheConfigs } from './helpers/config'

setDefaultTimeout(60000)

Before(async () => {
  await startWebDriver({ env: 'local' })
  await createSession({ env: 'local' })
  await cacheConfigs()
  await setConfigs(
    client.globals.backend_url,
    client.globals.backend_admin_username
  )
})

After(async () => {
  await closeSession()
  await stopWebDriver()
  await rollbackConfigs()
})
