import SidebarNav from 'web-runtime/src/components/SidebarNav/SidebarNav.vue'
import sidebarNavItemFixtures from '../../../__fixtures__/sidebarNavItems'
import { createStore, defaultPlugins, defaultStoreMockOptions, mount } from 'web-test-helpers'

jest.mock('uuid', () => ({
  v4: () => {
    return '00000000-0000-0000-0000-000000000000'
  }
}))

const slots = {
  bottom: '<span class="footer">Footer</span>'
}

describe('OcSidebarNav', () => {
  it('displays a bottom slot if given', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.findAll('.footer').length).toBe(1)
  })
  it('renders navItems into a list', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('toggles into closed state upon button click', async () => {
    const { wrapper, storeOptions } = getWrapper()
    await wrapper.find('.toggle-sidebar-button').trigger('click')
    await wrapper.vm.$nextTick()
    expect(storeOptions.actions.closeNavigation).toHaveBeenCalled()
  })
  it('toggles back into open state upon button click', async () => {
    const { wrapper, storeOptions } = getWrapper()
    storeOptions.state.navigation.closed = true
    await wrapper.find('.toggle-sidebar-button').trigger('click')
    await wrapper.vm.$nextTick()
    expect(storeOptions.actions.openNavigation).toHaveBeenCalled()
  })
  it('initially sets the highlighter to the active nav item', async () => {
    const { wrapper } = getWrapper()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.highlighterAttrs).toEqual({
      style: {
        transform: 'translateY(0px)',
        'transition-duration': '0.2s'
      }
    })
  })
})

function getWrapper() {
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  return {
    storeOptions,
    wrapper: mount(SidebarNav, {
      slots,
      props: {
        navItems: sidebarNavItemFixtures
      },
      global: {
        renderStubDefaultSlot: true,
        plugins: [...defaultPlugins(), store],
        stubs: { SidebarNavItem: true }
      }
    })
  }
}
