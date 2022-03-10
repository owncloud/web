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

import { config } from '../../config'
import { api, environment } from '../../support'
import { World } from './world'
import { state } from './shared'
import { Browser, chromium, firefox, webkit } from 'playwright'

export { World }

const usersEnvironment = new environment.UsersEnvironment()
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

BeforeAll(async function (this: World) {
  if (config.ocis) {
    return
  }

  await api.config.setLocking({
    value: false,
    user: usersEnvironment.getUser({ id: 'admin' })
  })
})

Before(function (this: World, { pickle }: ITestCaseHookParameter) {
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
})

const defaults = {
  reportHar: config.reportHar,
  reportTracing: config.reportTracing
}

After(async function (this: World, { result }: ITestCaseHookParameter) {
  if (!result) {
    return
  }

  config.reportHar = result.willBeRetried || defaults.reportHar
  config.reportTracing = result.willBeRetried || defaults.reportTracing

  if (result.status !== Status.PASSED) {
    await this.actorsEnvironment.close()
  }
})

AfterAll(() => state.browser && state.browser.close())

setWorldConstructor(World)
