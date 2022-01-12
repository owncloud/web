import { shallowMount, createLocalVue } from '@vue/test-utils'
import DesignSystem from 'owncloud-design-system'
import GetText from 'vue-gettext'

import ApplicationsMenu from 'web-runtime/src/components/ApplicationsMenu.vue'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(GetText, {
  translations: 'does-not-matter',
  silent: true
})

const menuLinks = [
  {
    name: 'Files',
    id: 'files',
    icon: 'folder',
    type: 'extension'
  },
  {
    name: 'External',
    id: 'external',
    icon: 'some-icon',
    type: '',
    url: 'http://some.org'
  }
]

describe('ApplicationsMenu component', () => {
  jest
    .spyOn(ApplicationsMenu.mixins[0].methods, 'navigation_getMenuItems')
    .mockImplementation(() => [
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
    ])

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
      'router-link': true
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
