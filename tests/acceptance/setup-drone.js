import { setDefaultTimeout, After, Before } from 'cucumber'
import { createSession, closeSession } from 'nightwatch-api'

setDefaultTimeout(120000)

Before(async () => {
  await createSession({ env: 'drone' })
})

After(async () => {
  await closeSession()
})
