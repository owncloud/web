import { filterResources } from '../../../../src/helpers/resource'

describe('filterResources', () => {
  it('filters given resources by given term', () => {
    const resultset = filterResources([{ name: 'foo' }, { name: 'bar' }], 'foo')

    expect(resultset).toMatchObject([{ name: 'foo' }])
    expect(resultset.length).toBe(1)
  })

  it('can limit the resultset', () => {
    const filter = filterResources([{ name: 'foo' }, { name: 'foo' }], 'foo', 1)

    expect(filter).toMatchObject([{ name: 'foo' }])
    expect(filter.length).toBe(1)
  })
})
