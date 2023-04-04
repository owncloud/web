import MobileNav from '../../../src/components/MobileNav.vue'
import {
  createStore,
  defaultPlugins,
  defaultStoreMockOptions,
  defaultComponentMocks,
  mount
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { NavItem } from 'web-runtime/src/helpers/navItems'

const selectors = {
  mobileNavBtn: '#mobile-nav-button',
  mobileNavItem: '.mobile-nav-item'
}

const navItems = [
  mock<NavItem>({ name: 'nav1', active: true }),
  mock<NavItem>({ name: 'nav2', active: false })
]

describe('MobileNav component', () => {
  it('renders the active nav item', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.find(selectors.mobileNavBtn).exists()).toBeTruthy()
    expect(wrapper.find(selectors.mobileNavBtn).text()).toEqual(navItems[0].name)
  })
  it('renders all nav items inside the drop menu', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.findAll(selectors.mobileNavItem).length).toBe(navItems.length)
  })
})

function getWrapper() {
  const mocks = {
    ...defaultComponentMocks()
  }
  const storeOptions = {
    ...defaultStoreMockOptions
  }
  const store = createStore(storeOptions)
  return {
    wrapper: mount(MobileNav, {
      props: {
        navItems
      },
      global: {
        plugins: [...defaultPlugins(), store],
        mocks
      }
    })
  }
}
