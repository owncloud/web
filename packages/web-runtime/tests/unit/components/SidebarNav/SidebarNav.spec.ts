import SidebarNav from 'web-runtime/src/components/SidebarNav/SidebarNav.vue'
import stubs from '../../../../../../tests/unit/stubs'
import sidebarNavItemFixtures from '../../../__fixtures__/sidebarNavItems'
import { createStore, defaultPlugins, mount } from 'web-test-helpers'

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
    expect(wrapper).toMatchSnapshot()
  })

  it('toggles into closed state upon button click', async () => {
    await wrapper.find('.toggle-sidebar-button').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })

  it('toggles back into open state upon button click', async () => {
    await wrapper.find('.toggle-sidebar-button').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
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
        plugins: [...defaultPlugins(), store],
        stubs: {
          ...stubs,
          'sidebar-nav-item': true,
          'oc-button': false
        }
      }
    })
  }
}
