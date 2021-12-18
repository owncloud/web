import { store } from '../store'
import { Actor } from '../types'
import path from 'path'
import { Browser, BrowserContextOptions } from 'playwright'
import { DateTime } from 'luxon'

interface continentOptions {
  browser: Browser
  context: {
    acceptDownloads: boolean
    recordDir: string
    recordVideo: boolean
    recordHar: boolean
    recordTracing: boolean
  }
}

const buildBrowserContextOptions = (
  uuid: string,
  options: continentOptions['context']
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

export class ActorEnvironment {
  private store = store.actorStore
  private _active: string
  private readonly options: continentOptions

  constructor(options: continentOptions) {
    this.options = options
  }

  public get active(): string {
    return this._active
  }

  public get({ id }: { id: string }): Actor {
    if (!this.store.has(id)) {
      throw new Error(`Actor '${id}' does not exist.`)
    }

    this._active = id
    return this.store.get(id)
  }

  public async create({ id }: { id: string }): Promise<Actor> {
    if (this.store.has(id)) {
      return this.get({ id })
    }

    const uuid = [DateTime.now().toFormat('yyyy-M-d-hh-mm-ss'), id].join('-')
    const context = await this.options.browser.newContext(
      buildBrowserContextOptions(uuid, this.options.context)
    )

    if (this.options.context.recordTracing) {
      await context.tracing.start({ screenshots: true, snapshots: true, sources: true })
    }

    const page = await context.newPage()
    const beforeClose = async (): Promise<void> => {
      this.store.delete(id)

      if (this.options.context.recordTracing) {
        await context.tracing.stop({
          path: path.join(this.options.context.recordDir, 'tracing', `${uuid}.zip`)
        })
      }
    }

    return this.store
      .set(id, {
        context,
        page,
        beforeClose,
        close: async (): Promise<void> => {
          await beforeClose()
          await page.close()
          await context.close()
        }
      })
      .get(id)
  }
}
