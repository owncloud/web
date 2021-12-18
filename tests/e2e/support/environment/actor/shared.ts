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
}

export const buildBrowserContextOptions = (
  uuid: string,
  options: ActorOptions['context']
): BrowserContextOptions => {
  const contextOptions: BrowserContextOptions = {
    acceptDownloads: options.acceptDownloads,
    ignoreHTTPSErrors: true
  }

  if (options.reportVideo) {
    contextOptions.recordVideo = {
      dir: path.join(options.reportDir, 'playwright', 'video')
    }
  }

  if (options.reportHar) {
    contextOptions.recordHar = {
      path: path.join(options.reportDir, 'playwright', 'har', `${uuid}.har`)
    }
  }

  return contextOptions
}
