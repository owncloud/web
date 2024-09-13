import { Browser, BrowserContextOptions } from '@playwright/test'
import path from 'path'

export interface ActorsOptions {
  browser: Browser
  context: {
    acceptDownloads: boolean
    reportDir: string
    tracingReportDir: string
    reportVideo: boolean
    reportHar: boolean
    reportTracing: boolean
    failOnUncaughtConsoleError: boolean
  }
}

export interface ActorOptions extends ActorsOptions {
  id: string
  namespace: string
}

export const buildBrowserContextOptions = (options: ActorOptions): BrowserContextOptions => {
  const contextOptions: BrowserContextOptions = {
    acceptDownloads: options.context.acceptDownloads,
    permissions: ['clipboard-read', 'clipboard-write'],
    ignoreHTTPSErrors: true,
    locale: 'en-US'
  }

  if (options.context.reportVideo) {
    contextOptions.recordVideo = {
      dir: path.join(options.context.reportDir, 'playwright', 'video')
    }
  }

  if (options.context.reportHar) {
    contextOptions.recordHar = {
      path: path.join(options.context.reportDir, 'playwright', 'har', `${options.namespace}.har`)
    }
  }

  return contextOptions
}
