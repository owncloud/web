import { setDefaultTimeout, After, Before } from 'cucumber'
import { createSession, closeSession, startWebDriver, stopWebDriver, client } from 'nightwatch-api'
// import { SauceLabs } from 'saucelabs'

setDefaultTimeout(600000)

Before(async () => {
  await startWebDriver({ env: 'sauce' })
  await createSession({ env: 'sauce' })
  await client
    .session(function (session) {
      console.log('  Link to saucelabs job: https://app.saucelabs.com/tests/' + session.sessionId)
    })
})

After(async () => {
  await closeSession()
  await stopWebDriver()
})
