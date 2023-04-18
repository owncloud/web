import { Space } from '../types'
import { createdSpaceStore } from '../store'

export class SpacesEnvironment {
  getSpace({ key }: { key: string }): Space {
    if (!createdSpaceStore.has(key)) {
      throw new Error(`space with key '${key}' not found`)
    }

    return createdSpaceStore.get(key)
  }

  createSpace({ key, space }: { key: string; space: Space }): Space {
    if (createdSpaceStore.has(key)) {
      throw new Error(`link with key '${key}' already exists`)
    }

    createdSpaceStore.set(key, space)

    return space
  }
}
