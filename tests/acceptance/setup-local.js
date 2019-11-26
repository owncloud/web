import { setDefaultTimeout, After, Before } from 'cucumber'
import { createSession, closeSession, startWebDriver, stopWebDriver, client } from 'nightwatch-api'
import fetch from 'node-fetch'
import httpHelper from './helpers/httpHelper'
import { join } from './helpers/path'

setDefaultTimeout(60000)

Before(async () => {
  await startWebDriver({ env: 'local' })
  await createSession({ env: 'local' })
  await setSkeletonDirectory()
})

async function setSkeletonDirectory () {
  const data = JSON.stringify({ directory: 'webUISkeleton' })
  const headers = {
    ...httpHelper.createAuthHeader(client.globals.backend_admin_username),
    'Content-Type': 'application/json'
  }
  const apiUrl = join(
    client.globals.backend_url,
    '/ocs/v2.php/apps/testing',
    '/api/v1/testingskeletondirectory?format=json'
  )

  const resp = await fetch(
    apiUrl,
    { method: 'POST', headers, body: data }
  )

  httpHelper.checkStatus(resp, 'Could not set skeletondirectory.')
}

After(async () => {
  await closeSession()
  await stopWebDriver()
})
