import {
  Before,
  BeforeAll,
  setDefaultTimeout,
  setWorldConstructor,
  ITestCaseHookParameter,
  AfterAll,
  After,
  Status
} from '@cucumber/cucumber'
import pino from 'pino'
import { Browser, chromium, firefox, webkit } from '@playwright/test'
import path from 'path'
import fs from 'fs'

import { config } from '../../config'
import { api, environment } from '../../support'
import { World } from './world'
import { state } from './shared'
import {
  createdSpaceStore,
  createdLinkStore,
  createdGroupStore,
  createdUserStore
} from '../../support/store'
import { User } from '../../support/types'
import { getTokenFromLogin } from '../../support/utils/tokenHelper'
import { createdTokenStore } from '../../support/store/token'
import { removeTempUploadDirectory } from '../../support/utils/runtimeFs'
import { refreshToken, setupKeycloakAdminUser } from '../../support/api/keycloak'

export { World }

const logger = pino({
  level: config.logLevel,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
})

setDefaultTimeout(config.debug ? -1 : config.timeout * 1000)
setWorldConstructor(World)

Before(async function (this: World, { pickle }: ITestCaseHookParameter) {
  this.feature = pickle
  this.actorsEnvironment.on('console', (actorId, message): void => {
    const msg = {
      actor: actorId,
      text: message.text(),
      type: message.type(),
      args: message.args(),
      location: message.location()
    }

    switch (message.type()) {
      case 'debug':
        logger.debug(msg)
        break
      case 'info':
        logger.info(msg)
        break
      case 'error':
        logger.error(msg)
        break
      case 'warning':
        logger.warn(msg)
        break
    }
  })
  if (!config.basicAuth) {
    await setAdminToken(state.browser)
  }

  if (config.keycloak) {
    await setKeycloakAdminToken(state.browser)
  }
})

BeforeAll(async (): Promise<void> => {
  const browserConfiguration = {
    slowMo: config.slowMo,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
    firefoxUserPrefs: {
      'media.navigator.streams.fake': true,
      'media.navigator.permission.disabled': true
    },
    headless: config.headless
  }

  state.browser = await {
    firefox: async (): Promise<Browser> => await firefox.launch(browserConfiguration),
    webkit: async (): Promise<Browser> => await webkit.launch(browserConfiguration),
    chrome: async (): Promise<Browser> =>
      await chromium.launch({ ...browserConfiguration, channel: 'chrome' }),
    chromium: async (): Promise<Browser> => await chromium.launch(browserConfiguration)
  }[config.browser]()

  // setup keycloak admin user
  if (config.keycloak) {
    const usersEnvironment = new environment.UsersEnvironment()
    setupKeycloakAdminUser(usersEnvironment.getUser({ key: 'admin' }))
  }
})

const defaults = {
  reportHar: config.reportHar,
  reportTracing: config.reportTracing
}

After(async function (this: World, { result, willBeRetried }: ITestCaseHookParameter) {
  if (!result) {
    return
  }

  config.reportHar = willBeRetried || defaults.reportHar
  config.reportTracing = willBeRetried || defaults.reportTracing

  if (result.status !== Status.PASSED) {
    await this.actorsEnvironment.close()
  }

  // refresh keycloak admin access token
  if (config.keycloak) {
    await refreshToken({ user: this.usersEnvironment.getUser({ key: 'admin' }) })
  }

  await cleanUpUser(this.usersEnvironment.getUser({ key: 'admin' }))
  await cleanUpSpaces(this.usersEnvironment.getUser({ key: 'admin' }))
  await cleanUpGroup(this.usersEnvironment.getUser({ key: 'admin' }))

  createdLinkStore.clear()
  createdTokenStore.clear()
  removeTempUploadDirectory()

  if (config.reportTracing) {
    filterTracingReports(result.status)
  }
})

AfterAll(async () => {
  if (state.browser) {
    await state.browser.close()
  }

  if (config.reportTracing) {
    // move failed tracing reports
    const failedDir = path.dirname(config.tracingReportDir) + '/failed'

    if (fs.existsSync(failedDir)) {
      fs.renameSync(failedDir, config.tracingReportDir)
    }
  }
})

function filterTracingReports(status: string) {
  const traceDir = config.tracingReportDir
  const failedDir = path.dirname(config.tracingReportDir) + '/failed'

  if (status !== 'PASSED') {
    if (!fs.existsSync(failedDir)) {
      fs.mkdirSync(failedDir, { recursive: true })
    }
    const reports = fs.readdirSync(traceDir)
    // collect tracings for failed tests
    reports.forEach((report) => {
      fs.renameSync(`${traceDir}/${report}`, `${failedDir}/${report}`)
    })
  } else {
    // clean up the tracing directory
    fs.rmSync(traceDir, { recursive: true })
  }
}

const cleanUpUser = async (adminUser: User) => {
  const requests = []
  createdUserStore.forEach((user) => {
    requests.push(api.provision.deleteUser({ user, admin: adminUser }))
  })
  await Promise.all(requests)
  createdUserStore.clear()
}

const cleanUpSpaces = async (adminUser: User) => {
  const requests = []
  createdSpaceStore.forEach((space) => {
    requests.push(
      api.graph
        .disableSpace({
          user: adminUser,
          space
        })
        .then(async (res) => {
          if (res.status === 204) {
            await api.graph.deleteSpace({
              user: adminUser,
              space
            })
          }
        })
    )
  })
  await Promise.all(requests)
  createdSpaceStore.clear()
}

const cleanUpGroup = async (adminUser: User) => {
  const requests = []
  createdGroupStore.forEach((group) => {
    requests.push(api.graph.deleteGroup({ group, admin: adminUser }))
  })

  await Promise.all(requests)
  createdGroupStore.clear()
}

const setAdminToken = async (browser: Browser) => {
  return getTokenFromLogin({ browser })
}

const setKeycloakAdminToken = async (browser: Browser) => {
  return getTokenFromLogin({
    browser,
    url: config.keycloakLoginUrl,
    tokenType: 'keycloak'
  })
}
