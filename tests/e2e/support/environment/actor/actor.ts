import { BrowserContext, Page, expect } from '@playwright/test'
import path from 'path'
import EventEmitter from 'events'
import { Actor } from '../../types'
import { ActorOptions, buildBrowserContextOptions } from './shared'

export class ActorEnvironment extends EventEmitter implements Actor {
  private readonly options: ActorOptions
  public context: BrowserContext
  public page: Page
  public tabs: Page[] = []

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
    this.tabs.push(this.page)

    this.page.on('pageerror', (exception) => {
      console.log(`[UNCAUGHT EXCEPTION] "${exception}"`)
      // make the test fail if FAIL_ON_UNCAUGHT_CONSOLE_ERR=true
      if (this.options.context.failOnUncaughtConsoleError) {
        expect(exception).not.toBeDefined()
      }
    })
  }

  public savePage(newPage: Page) {
    this.tabs.push(newPage)
    // set the new page
    this.page = newPage
  }

  public async newTab(): Promise<Page> {
    const page: Page = await this.context.newPage()
    this.tabs.push(page)
    this.page = page
    return page
  }

  public async closeCurrentTab(): Promise<void> {
    await this.page.close()
    this.tabs.pop()
    if (this.tabs.length === 0) {
      this.page = null
      return
    }
    this.page = this.tabs[this.tabs.length - 1]
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
