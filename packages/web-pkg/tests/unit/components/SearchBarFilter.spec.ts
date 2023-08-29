import { useRouteQuery } from 'web-pkg/src'
import SearchBarFilter from 'web-pkg/src/components/SearchBarFilter.vue'
import { defaultComponentMocks, defaultPlugins, shallowMount } from 'web-test-helpers'

jest.mock('web-pkg/src/composables/router')

const selectors = {
  filterChipStub: 'oc-filter-chip-stub'
}

describe('SearchBarFilter', () => {
  it('shows "Everywhere" as default option', () => {
    const { wrapper } = getWrapper({ currentFolderAvailable: true })
    const filterLabel = wrapper.findComponent<any>(selectors.filterChipStub).props('filterLabel')
    expect(filterLabel).toBe('Everywhere')
  })
  it('shows "Everywhere" as current option if no In here available', () => {
    const { wrapper } = getWrapper()
    const filterLabel = wrapper.findComponent<any>(selectors.filterChipStub).props('filterLabel')
    expect(filterLabel).toBe('Everywhere')
  })
  it('shows "In here" as current option if given via scope', () => {
    const { wrapper } = getWrapper({ useScope: 'true' })
    const filterLabel = wrapper.findComponent<any>(selectors.filterChipStub).props('filterLabel')
    expect(filterLabel).toBe('In here')
  })
})

function getWrapper({ currentFolderAvailable = false, useScope = null } = {}) {
  jest.mocked(useRouteQuery).mockImplementationOnce(() => useScope)

  const mocks = defaultComponentMocks()
  return {
    mocks,
    wrapper: shallowMount(SearchBarFilter, {
      props: {
        currentFolderAvailable
      },
      global: {
        plugins: [...defaultPlugins()],
        mocks,
        provide: mocks
      }
    })
  }
}
