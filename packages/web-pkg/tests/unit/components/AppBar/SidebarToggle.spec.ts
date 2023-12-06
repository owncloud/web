import SidebarToggle from '../../../../src/components/AppBar/SidebarToggle.vue'
import { eventBus } from '../../../../src/services'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks
} from 'web-test-helpers'

const selectors = {
  toggleSidebarBtn: '#files-toggle-sidebar'
}

describe('SidebarToggle component', () => {
  it.each([true, false])(
    'should show the "Toggle sidebar"-button with sidebar opened and closed',
    (isSideBarOpen) => {
      const { wrapper } = getWrapper({ isSideBarOpen })
      expect(wrapper.find(selectors.toggleSidebarBtn).exists()).toBeTruthy()
      expect(wrapper.html()).toMatchSnapshot()
    }
  )
  it('publishes the toggle-event to the sidebar on click', async () => {
    const { wrapper } = getWrapper()
    const eventSpy = jest.spyOn(eventBus, 'publish')
    await wrapper.find(selectors.toggleSidebarBtn).trigger('click')
    expect(eventSpy).toHaveBeenCalled()
  })
})

function getWrapper({ isSideBarOpen = false } = {}) {
  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks()
  return {
    storeOptions,
    mocks,
    wrapper: mount(SidebarToggle, {
      props: { isSideBarOpen },
      global: {
        mocks,
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
