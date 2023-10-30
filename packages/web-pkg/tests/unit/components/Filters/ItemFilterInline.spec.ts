import ItemFilterInline from '../../../../src/components/Filters/ItemFilterInline.vue'
import { InlineFilterOption } from '../../../../src/components/Filters/types'
import { defaultComponentMocks, defaultPlugins, mount } from 'web-test-helpers'
import { queryItemAsString } from '../../../../src/composables/appDefaults'
import { mock } from 'jest-mock-extended'

jest.mock('../../../../src/composables/appDefaults', () => ({
  appDefaults: jest.fn(),
  queryItemAsString: jest.fn()
}))

const selectors = {
  filterOption: '.item-inline-filter-option',
  filterOptionLabel: '.item-inline-filter-option-label',
  selectedOptionLabel: '.item-inline-filter-option-selected .item-inline-filter-option-label'
}

describe('ItemFilterInline', () => {
  const filterOptions = [
    mock<InlineFilterOption>({ name: 'filter1', label: 'filter1' }),
    mock<InlineFilterOption>({ name: 'filter2', label: 'filter2' })
  ]

  it('renders all given options', () => {
    const { wrapper } = getWrapper({ props: { filterOptions } })
    expect(wrapper.findAll(selectors.filterOption).length).toBe(filterOptions.length)
    expect(wrapper.findAll(selectors.filterOption).at(0).text()).toEqual(filterOptions[0].label)
    expect(wrapper.findAll(selectors.filterOption).at(1).text()).toEqual(filterOptions[1].label)
  })
  it('emits the "toggleFilter"-event on click on an option', async () => {
    const { wrapper } = getWrapper({ props: { filterOptions } })
    await wrapper.find(selectors.filterOption).trigger('click')
    expect(wrapper.emitted('toggleFilter').length).toBeGreaterThan(0)
  })
  describe('route query', () => {
    it('sets the active option as query param', async () => {
      const { wrapper, mocks } = getWrapper({ props: { filterOptions } })
      const currentRouteQuery = (mocks.$router.currentRoute as any).query
      expect(mocks.$router.push).not.toHaveBeenCalled()
      await wrapper.find(selectors.filterOption).trigger('click')
      expect(currentRouteQuery[wrapper.vm.queryParam]).toBeDefined()
      expect(mocks.$router.push).toHaveBeenCalled()
    })
    it('sets the active optin initially when given via query param', async () => {
      const initialQuery = filterOptions[1].name
      const { wrapper } = getWrapper({ initialQuery, props: { filterOptions } })
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.selectedOptionLabel).text()).toEqual(initialQuery)
    })
  })
})

function getWrapper({ props = {}, initialQuery = '' } = {}) {
  jest.mocked(queryItemAsString).mockImplementation(() => initialQuery)
  const mocks = defaultComponentMocks()
  return {
    mocks,
    wrapper: mount(ItemFilterInline, {
      props: {
        filterName: 'InlineFilter',
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
