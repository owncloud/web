import ItemFilterToggle from '../../../src/components/ItemFilterToggle.vue'
import { defaultComponentMocks, defaultPlugins, mount } from 'web-test-helpers'
import { queryItemAsString } from '../../../src/composables/appDefaults'

jest.mock('../../../src/composables/appDefaults', () => ({
  appDefaults: jest.fn(),
  queryItemAsString: jest.fn()
}))

const selectors = {
  labelSpan: '.oc-filter-chip-label',
  filterBtn: '.oc-filter-chip-button'
}

describe('ItemFilterToggle', () => {
  it('renders the toggle filter including its label', () => {
    const filterLabel = 'Toggle'
    const { wrapper } = getWrapper({ props: { filterLabel } })
    expect(wrapper.find(selectors.labelSpan).text()).toEqual(filterLabel)
  })
  it('emits the "toggleFilter"-event on click', async () => {
    const { wrapper } = getWrapper()
    await wrapper.find(selectors.filterBtn).trigger('click')
    expect(wrapper.emitted('toggleFilter').length).toBeGreaterThan(0)
  })
  describe('route query', () => {
    it('sets the active state as query param', async () => {
      const { wrapper, mocks } = getWrapper()
      const currentRouteQuery = (mocks.$router.currentRoute as any).query
      expect(mocks.$router.push).not.toHaveBeenCalled()
      await wrapper.find(selectors.filterBtn).trigger('click')
      expect(currentRouteQuery[wrapper.vm.queryParam]).toBeDefined()
      expect(mocks.$router.push).toHaveBeenCalled()
    })
    it('sets the active state initially when given via query param', () => {
      const { wrapper } = getWrapper({ initialQuery: 'true' })
      expect(wrapper.vm.filterActive).toEqual(true)
    })
  })
})

function getWrapper({ props = {}, initialQuery = '' } = {}) {
  jest.mocked(queryItemAsString).mockImplementation(() => initialQuery)
  const mocks = defaultComponentMocks()
  return {
    mocks,
    wrapper: mount(ItemFilterToggle, {
      props: {
        filterLabel: 'Toggle',
        filterName: 'toggle',
        ...props
      },
      global: {
        plugins: [...defaultPlugins()],
        mocks,
        provide: mocks
      }
    })
  }
}
