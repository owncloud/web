import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import TopBar from 'web-runtime/src/components/TopBar.vue'
import stubs from '../../../../tests/unit/config/stubs'

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
      stubs,
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
      stubs,
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
      stubs
    })

    wrapper.find('.oc-app-navigation-toggle').vm.$emit('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted().toggleAppNavigationVisibility).toBeTruthy()
  })
})
