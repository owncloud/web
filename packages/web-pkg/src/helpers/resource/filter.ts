import Fuse from 'fuse.js'
import { defaultFuseOptions } from '../fuse'

export const filterResources = (resources: unknown[], term: string, limit?: number): unknown[] => {
  const engine = new Fuse(resources, {
    ...defaultFuseOptions,
    keys: ['name', 'type', 'icon', 'extension', 'tags']
  })

  return (engine.search(term, { limit }) as any[]).map((result: any) => result.item)
}
