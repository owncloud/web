import { setDefaultTimeout, After, Before } from 'cucumber'
import { createSession, closeSession } from 'nightwatch-api'

setDefaultTimeout(60000)

Before(async () => {
  await createSession({ env: 'drone' })
})

After(async () => {
  await closeSession()
})
