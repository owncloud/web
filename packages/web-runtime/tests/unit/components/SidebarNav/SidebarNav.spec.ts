import SidebarNav from 'web-runtime/src/components/SidebarNav/SidebarNav.vue'
import sidebarNavItemFixtures from '../../../__fixtures__/sidebarNavItems'
import { createStore, defaultPlugins, defaultStubs, mount } from 'web-test-helpers'

jest.mock('uuid', () => ({
  v4: () => {
    return '00000000-0000-0000-0000-000000000000'
  }
}))

const slots = {
  bottom: '<span class="footer">Footer</span>'
}

describe('OcSidebarNav', () => {
  const { wrapper } = getWrapper()

  it('displays a bottom slot if given', () => {
    expect(wrapper.findAll('.footer').length).toBe(1)
  })

  it('renders navItems into a list', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('toggles into closed state upon button click', async () => {
    await wrapper.find('.toggle-sidebar-button').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('toggles back into open state upon button click', async () => {
    await wrapper.find('.toggle-sidebar-button').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})

function getWrapper() {
  const storeOptions = {
    state: {
      navigation: {
        closed: false
      }
    },
    mutations: {
      SET_CLOSED(state, value) {
        state.navigation.closed = value
      }
    },
    actions: {
      openNavigation({ commit }) {
        commit('SET_CLOSED', false)
      },
      closeNavigation({ commit }) {
        commit('SET_CLOSED', true)
      }
    }
  }
  const store = createStore(storeOptions)
  return {
    wrapper: mount(SidebarNav, {
      slots,
      props: {
        navItems: sidebarNavItemFixtures
      },
      global: {
        renderStubDefaultSlot: true,
        plugins: [...defaultPlugins(), store],
        stubs: {
          ...defaultStubs,
          'sidebar-nav-item': true,
          OcButton: false,
          'oc-icon': true,
          'oc-list': true
        }
      }
    })
  }
}
