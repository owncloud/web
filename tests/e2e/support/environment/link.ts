import { Link } from '../types'
import { linkStore } from '../store'

export class LinkEnvironment {
  getLink({ name }: { name: string }): Link {
    if (!linkStore.has(name)) {
      throw new Error(`link with name '${name}' not found`)
    }

    return linkStore.get(name)
  }

  createLink(link: Link): Link {
    if (linkStore.has(link.name)) {
      throw new Error(`link with name '${link.name}' already exists`)
    }

    linkStore.set(link.name, link)

    return link
  }
}
