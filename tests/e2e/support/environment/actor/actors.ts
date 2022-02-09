import { Actor } from '../../types'
import { ActorsOptions } from './shared'
import { ActorEnvironment } from './actor'
import { actorStore } from '../../store'
import EventEmitter from 'events'
import { ConsoleMessage } from 'playwright'

export declare interface ActorsEnvironment {
  on(event: 'console', listener: (actorId: string, consoleMessage: ConsoleMessage) => void): this
}

export class ActorsEnvironment extends EventEmitter {
  private store = actorStore
  private readonly options: ActorsOptions

  constructor(options: ActorsOptions) {
    super()
    this.options = options
  }

  public getActor({ id }: { id: string }): Actor {
    if (!this.store.has(id)) {
      throw new Error(`Actor '${id}' does not exist.`)
    }

    return this.store.get(id)
  }

  public async createActor({ id, namespace }: { id: string; namespace: string }): Promise<Actor> {
    if (this.store.has(id)) {
      return this.getActor({ id })
    }

    const actor = new ActorEnvironment({ id, namespace, ...this.options })
    await actor.setup()
    actor.on('closed', () => this.store.delete(id))
    actor.page.on('console', (message) => {
      this.emit('console', id, message)
    })

    return this.store.set(id, actor).get(id)
  }

  public async close(): Promise<void> {
    await Promise.all([...this.store.values()].map((actor) => actor.close()))
  }
}
