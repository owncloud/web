import { setDefaultTimeout, After, Before } from 'cucumber'
import { createSession, client } from 'nightwatch-api'

setDefaultTimeout(60000)

Before(async () => {
  let browser = process.env.BROWSER || 'chrome'
  await createSession({ env: `local_${browser}` })
})

After(async () => {
  await client.end()
})
