import { setDefaultTimeout, After, Before } from 'cucumber'
import { createSession, closeSession, client } from 'nightwatch-api'

setDefaultTimeout(60000)

Before(async () => {
  await createSession({ env: 'drone' })
  if (process.env.SAUCE_USERNAME) {
    await client
      .session(function (session) {
        console.log('  Link to saucelabs job: https://app.saucelabs.com/tests/' + session.sessionId)
      })
  }
})

After(async () => {
  await closeSession()
})
