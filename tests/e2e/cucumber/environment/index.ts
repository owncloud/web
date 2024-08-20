import {
  Before,
  BeforeAll,
  setDefaultTimeout,
  setWorldConstructor,
  ITestCaseHookParameter,
  AfterAll,
  After
} from '@cucumber/cucumber'
import pino from 'pino'
import { Browser, chromium, firefox, webkit } from '@playwright/test'

import { config } from '../../config'
import { api, environment } from '../../support'
import { World } from './world'
import { state } from './shared'
import {
  createdSpaceStore,
  createdLinkStore,
  createdGroupStore,
  createdUserStore,
  keycloakCreatedUser
} from '../../support/store'
import { Group, User } from '../../support/types'
import { getTokenFromLogin, setAccessToken } from '../../support/utils/tokenHelper'
import { createdTokenStore, keycloakTokenStore } from '../../support/store/token'
import { removeTempUploadDirectory } from '../../support/utils/runtimeFs'
import { refreshToken, setupKeycloakAdminUser } from '../../support/api/keycloak'
import { closeSSEConnections } from '../../support/environment/sse'

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
    // Currently, access token are received for keycloak via login
    // Todo: Make keycloak get it's access token via api
    if (config.keycloak) {
      await setAdminTokenFromLogin(state.browser)
      await setKeycloakAdminToken(state.browser)
    } else {
      await setAdminToken({ user: this.usersEnvironment.getUser({ key: 'admin' }) })
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

  await this.actorsEnvironment.close()

  // refresh keycloak admin access token
  if (config.keycloak) {
    await refreshToken({ user: this.usersEnvironment.getUser({ key: 'admin' }) })
    await setAdminTokenFromLogin(state.browser)
  }

  await cleanUpUser(this.usersEnvironment.getUser({ key: 'admin' }))
  await cleanUpSpaces(this.usersEnvironment.getUser({ key: 'admin' }))
  await cleanUpGroup(this.usersEnvironment.getUser({ key: 'admin' }))

  createdLinkStore.clear()
  createdTokenStore.clear()
  keycloakTokenStore.clear()
  removeTempUploadDirectory()
  closeSSEConnections()
})

AfterAll(async () => {
  closeSSEConnections()

  if (state.browser) {
    await state.browser.close()
  }
})

setWorldConstructor(World)

const cleanUpUser = async (adminUser: User) => {
  const requests: Promise<User>[] = []
  createdUserStore.forEach((user) => {
    requests.push(api.provision.deleteUser({ user, admin: adminUser }))
  })
  await Promise.all(requests)
  createdUserStore.clear()
  keycloakCreatedUser.clear()
}

const cleanUpSpaces = async (adminUser: User) => {
  const requests: Promise<void>[] = []
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
  const requests: Promise<Group>[] = []
  createdGroupStore.forEach((group) => {
    requests.push(api.graph.deleteGroup({ group, admin: adminUser }))
  })

  await Promise.all(requests)
  createdGroupStore.clear()
}

const setAdminToken = async ({ user }: { user: User }) => {
  return await setAccessToken({ username: user.id })
}

const setAdminTokenFromLogin = async (browser: Browser) => {
  return await getTokenFromLogin({ browser })
}

const setKeycloakAdminToken = async (browser: Browser) => {
  return await getTokenFromLogin({
    browser,
    url: config.keycloakLoginUrl,
    tokenType: 'keycloak'
  })
}
