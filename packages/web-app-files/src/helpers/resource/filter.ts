import Fuse from 'fuse.js'

export const filterResources = (resources: unknown[], term: string, limit?: number): unknown[] => {
  const engine = new Fuse(resources, {
    includeScore: true,
    useExtendedSearch: true,
    threshold: 0.3,
    keys: ['name', 'type', 'icon', 'extension']
  })

  return (engine.search(term, { limit }) as any[]).map((result: any) => result.item)
}
