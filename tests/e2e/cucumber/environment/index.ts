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

import { World } from './world'
import { state } from './shared'
import { config } from '../../config'
import { Group, User } from '../../support/types'
import { api, environment, utils, store } from '../../support'

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
    const user = this.usersEnvironment.getUser({ key: 'admin' })
    if (config.keycloak) {
      await api.keycloak.setAccessTokenForKeycloakOcisUser(user)
      await api.keycloak.setAccessTokenForKeycloakUser(user)
      await storeKeycloakGroups(user, this.usersEnvironment)
    } else {
      await api.token.setAccessAndRefreshToken(user)
      if (isOcm(pickle)) {
        config.federatedServer = true
        // need to set tokens for federated oCIS admin
        await api.token.setAccessAndRefreshToken(user)
        config.federatedServer = false
      }
    }
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

  const browsers: Record<string, () => Promise<Browser>> = {
    firefox: async (): Promise<Browser> => await firefox.launch(browserConfiguration),
    webkit: async (): Promise<Browser> => await webkit.launch(browserConfiguration),
    chrome: async (): Promise<Browser> =>
      await chromium.launch({ ...browserConfiguration, channel: 'chrome' }),
    chromium: async (): Promise<Browser> => await chromium.launch(browserConfiguration)
  }

  state.browser = await browsers[config.browser]()

  // setup keycloak admin user
  if (config.keycloak) {
    const usersEnvironment = new environment.UsersEnvironment()
    api.keycloak.setupKeycloakAdminUser(usersEnvironment.getUser({ key: 'admin' }))
  }
})

const defaults = {
  reportHar: config.reportHar,
  reportTracing: config.reportTracing
}

After(async function (this: World, { result, willBeRetried, pickle }: ITestCaseHookParameter) {
  config.federatedServer = false
  if (!result) {
    return
  }

  await this.actorsEnvironment.close()

  const adminUser = this.usersEnvironment.getUser({ key: 'admin' })

  // refresh keycloak admin access token
  if (config.keycloak) {
    await api.keycloak.refreshAccessTokenForKeycloakUser(adminUser)
    await api.keycloak.refreshAccessTokenForKeycloakOcisUser(adminUser)
  } else {
    await api.token.refreshAccessToken(adminUser)
  }

  if (isOcm(pickle)) {
    // need to set federatedServer config to true to delete federated oCIS users
    config.federatedServer = true
    await api.token.refreshAccessToken(adminUser)
    await cleanUpUser(store.federatedUserStore, this.usersEnvironment.getUser({ key: 'admin' }))
    config.federatedServer = false
  }
  await cleanUpUser(store.createdUserStore, this.usersEnvironment.getUser({ key: 'admin' }))
  await cleanUpSpaces(this.usersEnvironment.getUser({ key: 'admin' }))
  await cleanUpGroup(this.usersEnvironment.getUser({ key: 'admin' }))

  store.createdLinkStore.clear()
  store.createdTokenStore.clear()
  store.federatedTokenStore.clear()
  store.keycloakTokenStore.clear()
  utils.removeTempUploadDirectory()
  environment.closeSSEConnections()

  if (fs.existsSync(config.tracingReportDir)) {
    filterTracingReports(result.status)
  }

  // NOTE: config should be changed at the very end of the test
  config.reportHar = willBeRetried || defaults.reportHar
  config.reportTracing = willBeRetried || defaults.reportTracing
})

AfterAll(async () => {
  environment.closeSSEConnections()

  if (state.browser) {
    await state.browser.close()
  }

  // move failed tracing reports
  const failedDir = path.dirname(config.tracingReportDir) + '/failed'
  if (fs.existsSync(failedDir)) {
    fs.renameSync(failedDir, config.tracingReportDir)
  }
})

function filterTracingReports(status: string) {
  const traceDir = config.tracingReportDir
  const failedDir = path.dirname(config.tracingReportDir) + '/failed'

  if (status !== Status.PASSED) {
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

const cleanUpUser = async (createdUserStore, adminUser: User) => {
  const requests: Promise<User>[] = []
  createdUserStore.forEach((user) => {
    requests.push(api.provision.deleteUser({ user, admin: adminUser }))
  })
  await Promise.all(requests)
  createdUserStore.clear()
  store.keycloakCreatedUser.clear()
}

const cleanUpSpaces = async (adminUser: User) => {
  const requests: Promise<void>[] = []
  store.createdSpaceStore.forEach((space) => {
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
  store.createdSpaceStore.clear()
}

const cleanUpGroup = async (adminUser: User) => {
  const requests: Promise<Group>[] = []
  store.createdGroupStore.forEach((group) => {
    if (!group.id.startsWith('keycloak')) {
      requests.push(api.graph.deleteGroup({ group, admin: adminUser }))
    }
  })

  await Promise.all(requests)
  store.createdGroupStore.clear()
}

const isOcm = (pickle): boolean => {
  const tags = pickle.tags.map((tag) => tag.name)
  if (tags.includes('@ocm')) {
    return true
  }
  return false
}

/*
  store group created from keycloak on store
 */
const storeKeycloakGroups = async (adminUser: User, usersEnvironment) => {
  const groups = await api.graph.getGroups(adminUser)

  store.dummyKeycloakGroupStore.forEach((dummyGroup) => {
    const matchingGroup = groups.find((group) => group.displayName === dummyGroup.displayName)
    if (matchingGroup) {
      usersEnvironment.storeCreatedGroup({ group: { ...dummyGroup, uuid: matchingGroup.id } })
    }
  })
}
