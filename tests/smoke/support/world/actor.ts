import { browser } from './actor.setup'
import { actorStore } from '../store'
import { Actor } from '../types'
import path from 'path'
import { config } from '../config'

export class ActorContinent {
  private store = actorStore
  private _active: string

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

    const now = Date.now()
    const context = await browser.newContext({
      acceptDownloads: config.acceptDownloads,
      ignoreHTTPSErrors: true,
      ...(config.videoDir && {
        recordVideo: {
          dir: config.videoDir
        }
      }),
      ...(config.harDir && {
        recordHar: {
          path: path.join(config.harDir, `${now}-${id}.har`)
        }
      })
    })

    if (config.tracingDir) {
      await context.tracing.start({ screenshots: true, snapshots: true, sources: true })
    }

    const page = await context.newPage()
    const beforeClose = async (): Promise<void> => {
      this.store.delete(id)

      if (config.tracingDir) {
        await context.tracing.stop({ path: path.join(config.tracingDir, `${now}-${id}.trace.zip`) })
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
