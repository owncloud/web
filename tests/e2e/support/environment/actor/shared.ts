import { Browser, BrowserContextOptions } from 'playwright'
import path from 'path'

export interface ActorsOptions {
  browser: Browser
  context: {
    acceptDownloads: boolean
    reportDir: string
    reportVideo: boolean
    reportHar: boolean
    reportTracing: boolean
  }
}

export interface ActorOptions extends ActorsOptions {
  id: string
  namespace: string
}

export const buildBrowserContextOptions = (options: ActorOptions): BrowserContextOptions => {
  const contextOptions: BrowserContextOptions = {
    acceptDownloads: options.context.acceptDownloads,
    ignoreHTTPSErrors: true
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
