import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import TopBar from 'web-runtime/src/components/Topbar/TopBar.vue'
import stubs from '../../../../../../tests/unit/stubs'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueRouter)

const feedbackButtonPresent = (enabled) => ({
  options: { disableFeedbackLink: !enabled },
  themes: {
    default: {},
    'default-dark': {}
  },
  currentTheme: {
    logo: {
      topbar: 'example-logo.svg'
    }
  }
})

describe('Top Bar component', () => {
  jest.spyOn(TopBar.mixins[0].methods, 'navigation_getMenuItems').mockImplementation(() => [
    {
      icon: 'folder',
      iconUrl: undefined,
      title: 'Files',
      path: '/files'
    },
    {
      icon: 'some-icon',
      iconUrl: undefined,
      title: 'External',
      url: 'http://some.org',
      target: '_blank'
    },
    {
      icon: 'application',
      iconUrl: undefined,
      path: '/settings',
      title: 'Settings'
    }
  ])

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
      router: new VueRouter(),
      stubs,
      propsData: {
        applicationsList: ['testApp']
      }
    })

    expect(wrapper.html().indexOf('applications-menu-stub')).toBeGreaterThan(-1)
    expect(wrapper).toMatchSnapshot()
  })
})
