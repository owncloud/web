import SidebarNavItem from 'web-runtime/src/components/SidebarNav/SidebarNavItem.vue'
import sidebarNavItemFixtures from '../../../__fixtures__/sidebarNavItems'
import { createStore, defaultPlugins, mount } from 'web-test-helpers'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'

const exampleNavItem = sidebarNavItemFixtures[0]

const propsData = {
  name: exampleNavItem.name,
  active: false,
  target: exampleNavItem.route.path,
  icon: exampleNavItem.icon,
  index: '5',
  id: '123'
}

describe('OcSidebarNav', () => {
  it('renders navItem without toolTip if expanded', () => {
    const { wrapper } = getWrapper(false)
    expect(wrapper).toMatchSnapshot()
  })

  it('renders navItem with toolTip if collapsed', () => {
    const { wrapper } = getWrapper(true)
    expect(wrapper).toMatchSnapshot()
  })
})

function getWrapper(collapsed) {
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  return {
    wrapper: mount(SidebarNavItem, {
      props: {
        ...propsData,
        collapsed
      },
      global: {
        plugins: [...defaultPlugins(), store],
        stubs: { 'router-link': true }
      }
    })
  }
}
