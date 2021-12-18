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

import { config } from '../../config'
import { api, store } from '../../support'
import { World } from './world'
import { state } from './shared'
import { Browser, chromium, firefox, webkit } from 'playwright'

export { World }

setDefaultTimeout(process.env.PWDEBUG ? -1 : 60 * 1000)

BeforeAll(async function () {
  if (config.ocis) {
    return
  }

  await api.config.setLocking({ value: false, user: store.userStore.get('admin') })
})

Before(function (this: World, { pickle }: ITestCaseHookParameter) {
  this.feature = pickle
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

After(async function (this: World, { result }: ITestCaseHookParameter) {
  if (!result) {
    return
  }

  await this.attach(`Status: ${result?.status}. Duration:${result.duration?.seconds}s`)

  if (result.status !== Status.PASSED) {
    if (result.willBeRetried) {
      config.recordVideo = true
      config.recordHar = true
      config.recordTracing = true
    }

    await this.actorsEnvironment.close()
  }
})

AfterAll(() => state.browser && state.browser.close())

setWorldConstructor(World)
