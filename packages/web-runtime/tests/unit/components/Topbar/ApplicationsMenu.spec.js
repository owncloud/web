import { shallowMount, createLocalVue } from '@vue/test-utils'
import DesignSystem from 'owncloud-design-system'
import GetText from 'vue-gettext'

import ApplicationsMenu from 'web-runtime/src/components/Topbar/ApplicationsMenu.vue'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(GetText, {
  translations: 'does-not-matter',
  silent: true
})

const menuLinks = [
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
  }
]

describe('ApplicationsMenu component', () => {
  it('should render navigation with button and menu items in dropdown', () => {
    const wrapper = getWrapper(menuLinks)
    expect(wrapper).toMatchSnapshot()
  })
})

function getWrapper(applicationsList = []) {
  return shallowMount(ApplicationsMenu, {
    localVue,
    propsData: {
      applicationsList
    },
    stubs: {
      'oc-button': true,
      'oc-icon': true,
      'oc-drop': true,
      'router-link': true,
      'oc-list': true
    },
    directives: {
      'oc-tooltip': jest.fn()
    },
    mocks: {
      $route: {},
      $router: {
        resolve: () => {
          return {
            href: 'href'
          }
        }
      }
    }
  })
}
