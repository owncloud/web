import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import TopBar from 'web-runtime/src/components/TopBar.vue'
import stubs from '../../../../../tests/unit/stubs'

const localVue = createLocalVue()
localVue.use(Vuex)

const feedbackButtonPresent = (enabled) => ({
  options: { disableFeedbackLink: !enabled },
  themes: {
    default: {},
    'default-dark': {}
  },
  currentTheme: {
    logo: {
      sidebar: ''
    }
  }
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
          configuration: () => feedbackButtonPresent(true),
          user: () => ({
            id: 'einstein'
          })
        }
      }),
      localVue,
      stubs,
      propsData: {
        applicationsList: ['testApp']
      },
      mocks: {
        $route: defaultRoute()
      }
    })

    expect(wrapper.html().indexOf('applications-menu-stub')).toBeGreaterThan(-1)
    expect(wrapper).toMatchSnapshot()
  })
})
