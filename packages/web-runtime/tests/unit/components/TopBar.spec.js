import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import TopBar from 'web-runtime/src/components/TopBar.vue'
import stubs from '../../../../../tests/unit/stubs'

const localVue = createLocalVue()
localVue.use(Vuex)

const feedbackButtonPresent = enabled => ({
  options: { disableFeedbackLink: !enabled }
})

const defaultRoute = () => ({
  meta: {
    /* default is empty */
  }
})

describe('Top Bar component', () => {
  it('Displays applications menu', () => {
    const wrapper = shallowMount(TopBar, {
      store: new Vuex.Store({
        getters: {
          configuration: () => feedbackButtonPresent(true)
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
          configuration: () => feedbackButtonPresent(true)
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
