import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import TopBar from 'web-runtime/src/components/TopBar.vue'
import stubs from '../../../../tests/unit/stubs'
import axe from '../../../../tests/unit/helper/axe'

const localVue = createLocalVue()
localVue.use(Vuex)

const globalSearch = enabled => ({
  options: { hideSearchBar: !enabled }
})

const routeWithHiddenSearchBar = () => ({ meta: { hideSearchBar: true } })
const defaultRoute = () => ({
  meta: {
    /* default is empty */
  }
})

describe('Top Bar component', () => {
  describe('when search bar visible globally', () => {
    it('Displays search bar if not disabled for specified route', async () => {
      const wrapper = shallowMount(TopBar, {
        store: new Vuex.Store({
          getters: {
            configuration: () => globalSearch(true)
          }
        }),
        localVue,
        stubs,
        propsData: {
          userId: 'einstein',
          userDisplayName: 'Albert Einstein'
        },
        mocks: {
          $route: defaultRoute()
        }
      })

      await expect(axe(wrapper.element)).resolves.toHaveNoViolations()
      expect(wrapper.html().indexOf('search-bar-stub')).toBeGreaterThan(-1)
      expect(wrapper).toMatchSnapshot()
    })

    it('Hides the search bar if disabled for specified route', () => {
      const wrapper = shallowMount(TopBar, {
        store: new Vuex.Store({
          getters: {
            configuration: () => globalSearch(true)
          }
        }),
        localVue,
        stubs,
        propsData: {
          userId: 'einstein',
          userDisplayName: 'Albert Einstein'
        },
        mocks: {
          $route: routeWithHiddenSearchBar()
        }
      })

      expect(wrapper.html().indexOf('search-bar-stub')).toEqual(-1)
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('when search bar hidden globally', () => {
    it('Hides search bar even if not disabled for specified route', () => {
      const wrapper = shallowMount(TopBar, {
        store: new Vuex.Store({
          getters: {
            configuration: () => globalSearch(false)
          }
        }),
        localVue,
        stubs,
        propsData: {
          userId: 'einstein',
          userDisplayName: 'Albert Einstein'
        },
        mocks: {
          $route: defaultRoute()
        }
      })

      expect(wrapper.html().indexOf('search-bar-stub')).toEqual(-1)
      expect(wrapper).toMatchSnapshot()
    })

    it('Hides the search bar if disabled for specified route', () => {
      const wrapper = shallowMount(TopBar, {
        store: new Vuex.Store({
          getters: {
            configuration: () => globalSearch(false)
          }
        }),
        localVue,
        stubs,
        propsData: {
          userId: 'einstein',
          userDisplayName: 'Albert Einstein'
        },
        mocks: {
          $route: routeWithHiddenSearchBar()
        }
      })

      expect(wrapper.html().indexOf('search-bar-stub')).toEqual(-1)
      expect(wrapper).toMatchSnapshot()
    })
  })

  it('Displays applications menu', () => {
    const wrapper = shallowMount(TopBar, {
      store: new Vuex.Store({
        getters: {
          configuration: () => globalSearch(false)
        }
      }),
      localVue,
      stubs,
      propsData: {
        userId: 'einstein',
        userDisplayName: 'Albert Einstein',
        applicationsList: ['testApp']
      },
      mocks: {
        $route: defaultRoute()
      }
    })

    expect(wrapper.html().indexOf('applications-menu-stub')).toBeGreaterThan(-1)
    expect(wrapper).toMatchSnapshot()
  })

  it('Emits toggle of app navigation visibility', async () => {
    const wrapper = shallowMount(TopBar, {
      store: new Vuex.Store({
        getters: {
          configuration: () => globalSearch(true)
        }
      }),
      localVue,
      stubs,
      mocks: {
        $route: defaultRoute()
      }
    })

    wrapper.find('.oc-app-navigation-toggle').vm.$emit('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted().toggleAppNavigationVisibility).toBeTruthy()
  })
})
