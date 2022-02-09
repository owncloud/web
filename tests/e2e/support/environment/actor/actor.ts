import { Actor } from '../../types'
import { ActorOptions, buildBrowserContextOptions } from './shared'
import { BrowserContext, Page } from 'playwright'
import path from 'path'
import EventEmitter from 'events'

export declare interface ActorEnvironment {
  on(event: 'closed', listener: () => void): this
}

export class ActorEnvironment extends EventEmitter implements Actor {
  private readonly options: ActorOptions
  public context: BrowserContext
  public page: Page

  constructor(options: ActorOptions) {
    super()
    this.options = options
  }

  async setup(): Promise<void> {
    this.context = await this.options.browser.newContext(buildBrowserContextOptions(this.options))

    if (this.options.context.reportTracing) {
      await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true })
    }

    this.page = await this.context.newPage()
  }

  async close(): Promise<void> {
    if (this.options.context.reportTracing) {
      await this.context?.tracing.stop({
        path: path.join(
          this.options.context.reportDir,
          'playwright',
          'tracing',
          `${this.options.namespace}.zip`
        )
      })
    }

    await this.page?.close()
    await this.context?.close()

    this.emit('closed')
  }
}
