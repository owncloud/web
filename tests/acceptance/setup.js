import { setDefaultTimeout, After, Before, defineParameterType } from 'cucumber'
import { createSession, closeSession, client, startWebDriver, stopWebDriver } from 'nightwatch-api'
import { rollbackConfigs, setConfigs, cacheConfigs } from './helpers/config'
import { getAllLogsWithDateTime } from './helpers/browserConsole.js'
const codify = require('./helpers/codify')

const ldap = require('./helpers/ldapHelper')

const RUNNING_ON_CI = !!process.env.CI
const RUNNING_ON_SAUCELABS = !!process.env.SAUCE_USERNAME

const CUCUMBER_LOCAL_TIMEOUT = 60000
const CUCUMBER_DRONE_TIMEOUT = 180000
const SAUCELABS_ASYNC_SCRIPT_TIMEOUT = 10000
const CUCUMBER_TIMEOUT = RUNNING_ON_CI ? CUCUMBER_DRONE_TIMEOUT : CUCUMBER_LOCAL_TIMEOUT
setDefaultTimeout(CUCUMBER_TIMEOUT)

let env = RUNNING_ON_CI ? 'drone' : 'local'
env = RUNNING_ON_SAUCELABS ? 'saucelabs' : env

defineParameterType({
  name: 'code',
  regexp: /"([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'/,
  type: String,
  transformer: s => codify.replaceInlineCode(s)
})

Before(function startDriverOnLocal () {
  return RUNNING_ON_CI || startWebDriver({ env })
})

Before(function createSessionForEnv () {
  return createSession({ env })
})

Before(function logSessionInfoOnSauceLabs () {
  if (process.env.SAUCE_USERNAME) {
    return client
      .session(function (session) {
        console.log('  Link to saucelabs job: https://app.saucelabs.com/tests/' + session.sessionId)
      })
      .timeoutsAsyncScript(SAUCELABS_ASYNC_SCRIPT_TIMEOUT)
  }
})

Before(function createLdapClient () {
  if (client.globals.ocis) {
    return ldap.createClient().then(ldapClient => {
      client.globals.ldapClient = ldapClient
    })
  }
})

After(function deleteLdapClient () {
  if (client.globals.ocis && client.globals.ldapClient) {
    return ldap.terminate(client.globals.ldapClient)
  }
})

async function cacheAndSetConfigs (server) {
  if (client.globals.ocis) {
    return
  }
  await cacheConfigs(server)
  return setConfigs(
    server,
    client.globals.backend_admin_username
  )
}

Before(function cacheAndSetConfigsOnLocal () {
  if (client.globals.ocis) {
    return
  }
  return cacheAndSetConfigs(client.globals.backend_url)
})

Before(function cacheAndSetConfigsOnRemoteIfExists () {
  if (client.globals.ocis) {
    return
  }
  if (client.globals.remote_backend_url) {
    return cacheAndSetConfigs(client.globals.remote_backend_url)
  }
})

// After hooks are run in reverse order in which they are defined
// https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/hooks.md#hooks
After(function rollbackConfigsOnRemoteIfExists () {
  if (client.globals.ocis) {
    return
  }
  if (client.globals.remote_backend_url) {
    return rollbackConfigs(client.globals.remote_backend_url)
  }
})

After(function rollbackConfigsOnLocal () {
  if (client.globals.ocis) {
    return
  }
  return rollbackConfigs(client.globals.backend_url)
})

After(function stopDriverIfOnLocal () {
  return RUNNING_ON_CI || stopWebDriver()
})

After(function closeSessionForEnv () {
  return closeSession()
})

After(async function tryToReadBrowserConsoleOnFailure ({ result }) {
  if (client.globals.ocis) {
    return
  }
  if (result.status === 'failed') {
    const logs = await getAllLogsWithDateTime('SEVERE')
    if (logs.length > 0) {
      console.log('\nThe following logs were found in the browser console:\n')
      logs.forEach(log => console.log(log))
    }
  }
})
