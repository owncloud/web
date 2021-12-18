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
import { chromium, firefox, webkit } from 'playwright'

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
  state.browser = await { chromium, webkit, firefox }[config.browser].launch({
    slowMo: config.slowMo,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
    firefoxUserPrefs: {
      'media.navigator.streams.fake': true,
      'media.navigator.permission.disabled': true
    },
    headless: config.headless
  })
})

After(async function (this: World, { result }: ITestCaseHookParameter) {
  if (result.status !== Status.PASSED) {
    await this.actorContinent.get({ id: this.actorContinent.active }).beforeClose()
  }
})

AfterAll(() => state.browser && state.browser.close())

setWorldConstructor(World)
