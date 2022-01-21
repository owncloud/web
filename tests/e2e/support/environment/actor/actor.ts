import { Actor } from '../../types'
import { ActorOptions, buildBrowserContextOptions } from './shared'
import { BrowserContext, Page } from 'playwright'
import { DateTime } from 'luxon'
import path from 'path'
import EventEmitter from 'events'

export declare interface ActorEnvironment {
  on(event: 'closed', listener: () => void): this
}

export class ActorEnvironment extends EventEmitter implements Actor {
  private readonly uuid: string
  private readonly options: ActorOptions
  public context: BrowserContext
  public page: Page

  constructor(options: ActorOptions) {
    super()
    this.uuid = [DateTime.now().toFormat('yyyy-M-d-hh-mm-ss'), "feature.name", options.id].join('-')
    this.options = options
  }

  async setup(): Promise<void> {
    this.context = await this.options.browser.newContext(
      buildBrowserContextOptions(this.uuid, this.options.context)
    )

    if (this.options.context.reportTracing) {
      await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true })
    }

    this.page = await this.context.newPage()
  }

  async close(): Promise<void> {
    if (this.options.context.reportTracing) {
      await this.context?.tracing.stop({
        path: path.join(this.options.context.reportDir, 'playwright', 'tracing', `${this.uuid}.zip`)
      })
    }

    await this.page?.close()
    await this.context?.close()

    this.emit('closed')
  }
}
