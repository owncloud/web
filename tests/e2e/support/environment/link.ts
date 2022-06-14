import { Link } from '../types'
import { linkStore } from '../store'

export class LinksEnvironment {
  getLink({ name }: { name: string }): Link {
    if (!linkStore.has(name)) {
      throw new Error(`link with name '${name}' not found`)
    }
    return linkStore.get(name)
  }

  updateLinkName({ key, link }: { key: string; link: Link }): any {
    if (!linkStore.has(key)) {
      throw new Error(`link with name '${key}' not found`)
    }
    linkStore.set(link.name, link)
    linkStore.delete(key)
  }

  createLink({ key, link }: { key: string; link: Link }): Link {
    if (linkStore.has(key)) {
      throw new Error(`link with key '${key}' already exists`)
    }
    linkStore.set(key, link)
    return link
  }

  deleteLink({ key }: { key: string }): boolean {
    if (linkStore.has(key)) {
      return linkStore.delete(key)
    }
    throw new Error(`link with key '${key}' doesn't exist`)
  }
}
