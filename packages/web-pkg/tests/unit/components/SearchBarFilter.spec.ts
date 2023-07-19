import { useRouteQuery } from 'web-pkg/src'
import SearchBarFilter from 'web-pkg/src/components/SearchBarFilter.vue'
import { defaultComponentMocks, defaultPlugins, shallowMount } from 'web-test-helpers'

jest.mock('web-pkg/src/composables/router')

const selectors = {
  filterChipStub: 'oc-filter-chip-stub'
}

describe('SearchBarFilter', () => {
  it('shows "All Files" as current option if no current folder available', () => {
    const { wrapper } = getWrapper()
    const filterLabel = wrapper.findComponent<any>(selectors.filterChipStub).props('filterLabel')
    expect(filterLabel).toBe('All Files')
  })
  it('shows "Current Folder" as current option if current folder available', () => {
    const { wrapper } = getWrapper({ currentFolderAvailable: true })
    const filterLabel = wrapper.findComponent<any>(selectors.filterChipStub).props('filterLabel')
    expect(filterLabel).toBe('Current Folder')
  })
  it('shows "Current Folder" as current option if given via scipe', () => {
    const { wrapper } = getWrapper({ useScope: 'true' })
    const filterLabel = wrapper.findComponent<any>(selectors.filterChipStub).props('filterLabel')
    expect(filterLabel).toBe('Current Folder')
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
