import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import Stubs from '../config/stubs'

import TopBar from '@/components/Top-Bar.vue'

const localVue = createLocalVue()
const search = enabled => ({
  options: { hideSearchBar: !enabled }
})

localVue.use(Vuex)

describe('Top Bar component', () => {
  it('Displays search bar if enabled', () => {
    const wrapper = shallowMount(TopBar, {
      store: new Vuex.Store({
        getters: {
          configuration: () => search(true)
        }
      }),
      localVue,
      stubs: Stubs,
      propsData: {
        userId: 'einstein',
        userDisplayName: 'Albert Einstein'
      }
    })

    expect(wrapper.html().indexOf('search-bar-stub')).toBeGreaterThan(-1)
    expect(wrapper).toMatchSnapshot()
  })

  it('Displays applications menu', () => {
    const wrapper = shallowMount(TopBar, {
      store: new Vuex.Store({
        getters: {
          configuration: () => search(false)
        }
      }),
      localVue,
      stubs: Stubs,
      propsData: {
        userId: 'einstein',
        userDisplayName: 'Albert Einstein',
        applicationsList: ['testApp']
      }
    })

    expect(wrapper.html().indexOf('applications-menu-stub')).toBeGreaterThan(-1)
    expect(wrapper).toMatchSnapshot()
  })

  it('Emits toggle of app navigation visibility', async () => {
    const wrapper = shallowMount(TopBar, {
      store: new Vuex.Store({
        getters: {
          configuration: () => search(true)
        }
      }),
      localVue,
      stubs: Stubs
    })

    wrapper.find('.oc-app-navigation-toggle').vm.$emit('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted().toggleAppNavigationVisibility).toBeTruthy()
  })
})
