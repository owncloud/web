import { setDefaultTimeout, After, Before } from 'cucumber'
import { createSession, closeSession } from 'nightwatch-api'

setDefaultTimeout(60000)

Before(async () => {
  await createSession({ env: 'drone' })
  console.log("Before")
})

After(async () => {
  await closeSession()
  console.log("After")
})
