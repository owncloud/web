import { defaultPlugins, mount } from 'web-test-helpers'
import OcFilterChip from './OcFilterChip.vue'

const selectors = {
  clearBtn: '.oc-filter-chip-clear'
}

describe('OcFilterChip', () => {
  it('renders the filterName when no selected item has been given', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('renders the first selected item name when selected items have been given', () => {
    const { wrapper } = getWrapper({ props: { selectedItemNames: ['Einstein', 'Marie'] } })
    expect(wrapper.html()).toMatchSnapshot()
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
      props: { filterName: 'Users', selectedItemNames: [], ...props },
      global: { plugins: [...defaultPlugins()] }
    })
  }
}
