import { setDefaultTimeout, After, Before } from 'cucumber'
import { createSession, closeSession, client } from 'nightwatch-api'
import { rollbackConfigs, setConfigs, cacheConfigs } from './helpers/config'

setDefaultTimeout(180000)

Before(async () => {
  await createSession({ env: 'drone' })
  if (process.env.SAUCE_USERNAME) {
    await client
      .session(function (session) {
        console.log('  Link to saucelabs job: https://app.saucelabs.com/tests/' + session.sessionId)
      })
  }
  await cacheConfigs()
  await setConfigs(
    client.globals.backend_url,
    client.globals.backend_admin_username
  )
})

After(async () => {
  await closeSession()
  await rollbackConfigs()
})
