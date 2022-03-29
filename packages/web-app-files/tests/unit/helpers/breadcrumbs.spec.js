import { breadcrumbsFromPath, concatBreadcrumbs } from '../../../src/helpers/breadcrumbs'

describe('builds an array of breadcrumbitems', () => {
  it('from a path', () => {
    const breadCrumbs = breadcrumbsFromPath('/files/spaces/personal/home/test', '/test')
    expect(breadCrumbs).toEqual([
      { allowContextActions: true, text: 'test', to: '/files/spaces/personal/home/test' }
    ])
  })

  it('from an array of breadcrumbitems', () => {
    const initialBreadCrumbs = [{ text: 'Foo' }, { text: 'Bar' }]
    const breadCrumbsFromPath = breadcrumbsFromPath('/app/foo/bar?all=500', '/bar')
    const result = concatBreadcrumbs(...initialBreadCrumbs, breadCrumbsFromPath)
    expect(result[0]).toMatchObject({ text: 'Foo' })
    expect(result[1]).toMatchObject({ text: 'Bar' })
    expect(JSON.stringify(result[2])).toEqual(
      JSON.stringify({
        allowContextActions: undefined,
        onClick: () => jest.fn(() => {}),
        text: undefined
      })
    )
  })
})
