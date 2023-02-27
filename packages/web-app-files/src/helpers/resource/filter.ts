import Fuse from 'fuse.js'

export const filterResources = (resources: unknown[], term: string, limit?: number): unknown[] => {
  const engine = new Fuse(resources, {
    includeScore: false,
    useExtendedSearch: true,
    threshold: 0.1,
    keys: ['name', 'type', 'icon', 'extension', 'tags']
  })

  return (engine.search(term, { limit }) as any[]).map((result: any) => result.item)
}
