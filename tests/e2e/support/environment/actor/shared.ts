import { Browser, BrowserContextOptions } from 'playwright'
import path from 'path'

export interface ActorsOptions {
  browser: Browser
  context: {
    acceptDownloads: boolean
    recordDir: string
    recordVideo: boolean
    recordHar: boolean
    recordTracing: boolean
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

  if (options.recordVideo) {
    contextOptions.recordVideo = {
      dir: path.join(options.recordDir, 'video')
    }
  }

  if (options.recordHar) {
    contextOptions.recordHar = {
      path: path.join(options.recordDir, 'har', `${uuid}.har`)
    }
  }

  return contextOptions
}
