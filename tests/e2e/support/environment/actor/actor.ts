import { Actor } from '../../types'
import { ActorOptions, buildBrowserContextOptions } from './shared'
import { BrowserContext, Page } from '@playwright/test'
import path from 'path'
import EventEmitter from 'events'

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

  public async newPage(newPage: Page): Promise<Page> {
    // close the old page
    await this.page.close()
    // set the new page
    this.page = newPage
    return this.page
  }

  async close(): Promise<void> {
    if (this.options.context.reportTracing) {
      await this.context?.tracing.stop({
        path: path.join(this.options.context.tracingReportDir, `${this.options.namespace}.zip`)
      })
    }

    await this.page?.close()
    await this.context?.close()

    this.emit('closed')
  }
}
