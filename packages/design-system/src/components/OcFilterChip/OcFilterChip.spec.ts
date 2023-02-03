import { defaultPlugins, mount } from 'web-test-helpers'
import OcFilterChip from './OcFilterChip.vue'

const selectors = {
  filterChipLabel: '.oc-filter-chip-label',
  clearBtn: '.oc-filter-chip-clear'
}

describe('OcFilterChip', () => {
  it('renders the filterLabel when no selected item has been given', () => {
    const filterLabel = 'Users'
    const { wrapper } = getWrapper({ props: { filterLabel } })
    expect(wrapper.find(selectors.filterChipLabel).text()).toEqual(filterLabel)
  })
  it('renders the first selected item name when selected items have been given', () => {
    const selectedItemNames = ['Einstein', 'Marie']
    const { wrapper } = getWrapper({ props: { selectedItemNames } })
    expect(wrapper.find(selectors.filterChipLabel).text()).toEqual(selectedItemNames[0])
  })
  it('emits the "clearFilter"-event when clicking the clear-button', async () => {
    const { wrapper } = getWrapper({ props: { selectedItemNames: ['Einstein', 'Marie'] } })
    await wrapper.find(selectors.clearBtn).trigger('click')
    expect(wrapper.emitted('clearFilter')).toBeTruthy()
  })
})

const getWrapper = ({ props = {} } = {}) => {
  return {
    wrapper: mount(OcFilterChip, {
      props: { filterLabel: 'Users', selectedItemNames: [], ...props },
      global: { plugins: [...defaultPlugins()] }
    })
  }
}
