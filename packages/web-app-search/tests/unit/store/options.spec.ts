import optionsStore from '../../../src/store/options'

describe('search options store', () => {
  test('by default the search is visible', () => {
    const { state, getters } = optionsStore
    const { hideSearchBar } = getters.options(state) as any
    expect(hideSearchBar).toBe(false)
  })
})
