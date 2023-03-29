import { Space } from '../types'
import { spaceStore } from '../store'

export class SpacesEnvironment {
  getSpace({ key }: { key: string }): Space {
    if (!spaceStore.has(key)) {
      throw new Error(`space with key '${key}' not found`)
    }

    return spaceStore.get(key)
  }

  createSpace({ key, space }: { key: string; space: Space }): Space {
    if (spaceStore.has(key)) {
      throw new Error(`link with key '${key}' already exists`)
    }

    spaceStore.set(key, space)

    return space
  }
}
