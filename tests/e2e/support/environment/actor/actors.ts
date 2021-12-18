import { Actor } from '../../types'
import { ActorsOptions } from './shared'
import { ActorEnvironment } from './actor'
import { actorStore } from '../../store'

export class ActorsEnvironment {
  private store = actorStore
  private activeActorId: string
  private readonly options: ActorsOptions

  constructor(options: ActorsOptions) {
    this.options = options
  }

  public get activeActor(): Actor {
    return this.getActor({ id: this.activeActorId })
  }

  public getActor({ id }: { id: string }): Actor {
    if (!this.store.has(id)) {
      throw new Error(`Actor '${id}' does not exist.`)
    }

    this.activeActorId = id
    return this.store.get(id)
  }

  public async createActor({ id }: { id: string }): Promise<Actor> {
    if (this.store.has(id)) {
      return this.getActor({ id })
    }

    const actor = new ActorEnvironment({ id, ...this.options })
    await actor.setup()

    actor.on('closed', () => this.store.delete(id))

    return this.store.set(id, actor).get(id)
  }

  public async close(): Promise<void> {
    await Promise.all([...this.store.values()].map((actor) => actor.close()))
  }
}
