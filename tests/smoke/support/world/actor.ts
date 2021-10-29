import { browser } from './actor.setup'
import { actorStore } from '../store'
import { Actor } from '../types'

export class ActorContinent {
  private store = actorStore

  public get({ id }: { id: string }): Actor {
    if (!this.store.has(id)) {
      throw new Error(`Actor '${id}' does not exist.`)
    }

    return this.store.get(id)
  }

  public async create({ id }: { id: string }): Promise<Actor> {
<<<<<<< HEAD
    if (this.store.has(id)) {
      return this.get({ id })
    }

=======
    
>>>>>>> 7e733127 (add remove step/add check that file exist/not exist)
    const context = await browser.newContext({
      acceptDownloads: true,
      ignoreHTTPSErrors: true
    })
    const page = await context.newPage()

    return this.store
      .set(id, {
        context,
        page,
        close: async (): Promise<void> => {
          this.store.delete(id)
          await page.close()
          await context.close()
        }
      })
      .get(id)
  }
}
