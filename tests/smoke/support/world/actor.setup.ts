import { Browser, chromium, firefox, LaunchOptions, webkit } from 'playwright'
import { AfterAll, BeforeAll } from '@cucumber/cucumber'
import { config } from '../config'

export let browser: Browser

const browserOptions: LaunchOptions = {
  slowMo: config.slowMo,
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  firefoxUserPrefs: {
    'media.navigator.streams.fake': true,
    'media.navigator.permission.disabled': true
  },
  headless: config.headless
}

BeforeAll(
  async (): Promise<void> => {
    browser = await {
      firefox: async (): Promise<Browser> => await firefox.launch(browserOptions),
      webkit: async (): Promise<Browser> => await webkit.launch(browserOptions),
      chrome: async (): Promise<Browser> =>
        await chromium.launch({ ...browserOptions, channel: 'chrome' }),
      chromium: async (): Promise<Browser> => await chromium.launch(browserOptions)
    }[config.browser]()
  }
)
AfterAll(() => browser && browser.close())
