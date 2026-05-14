import { Space } from '../types'
import { createdSpaceStore } from '../store'
import { World } from '../../environment/world'

export class SpacesEnvironment {
  getSpace({ key, world }: { key: string; world?: World }): Space {
    const storeKey = world ? this.getWorldKey(key, world) : key

    if (!createdSpaceStore.has(storeKey)) {
      throw new Error(`space with key '${storeKey}' not found`)
    }

    return createdSpaceStore.get(storeKey)
  }

  createSpace({ key, space, world }: { key: string; space: Space; world?: World }): Space {
    const storeKey = world ? this.getWorldKey(key, world) : key

    if (createdSpaceStore.has(storeKey)) {
      throw new Error(`space with key '${storeKey}' already exists`)
    }

    createdSpaceStore.set(storeKey, space)

    return space
  }

  private getWorldKey(key: string, world: World): string {
    return `${key}-w${world.workerIndex}-${world.testId}`
  }
}
