import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'

import SidebarNav from 'web-runtime/src/components/SidebarNav/SidebarNav.vue'

import stubs from '../../../../../../tests/unit/stubs'
import sidebarNavItemFixtures from '../../../../../../__fixtures__/sidebarNavItems'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)

const slots = {
  bottom: '<span class="footer">Footer</span>'
}

describe('OcSidebarNav', () => {
  const wrapper = getWrapper()

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
  return mount(SidebarNav, {
    store: new Vuex.Store({
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
    }),
    localVue,
    stubs: {
      ...stubs,
      'sidebar-nav-item': true,
      'oc-button': false
    },
    slots,
    propsData: {
      navItems: sidebarNavItemFixtures
    }
  })
}
