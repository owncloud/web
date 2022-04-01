import { Link } from '../types'
import { linkStore } from '../store'

export class LinksEnvironment {
  getLink({ key }: { key: string }): Link {
    if (!linkStore.has(key)) {
      throw new Error(`link with key '${key}' not found`)
    }

    return linkStore.get(key)
  }

  createLink({ key, link }: { key: string; link: Link }): Link {
    if (linkStore.has(key)) {
      throw new Error(`link with key '${key}' already exists`)
    }

    linkStore.set(key, link)

    return link
  }
}
