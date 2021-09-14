import { shallowMount, createLocalVue } from '@vue/test-utils'
import DesignSystem from 'owncloud-design-system'
import GetText from 'vue-gettext'
import VueRouter from 'vue-router'

import ApplicationsMenu from 'web-runtime/src/components/ApplicationsMenu.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)
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

const selectors = {
  appSwitcherButton: '#_appSwitcherButton',
  ocDrop: 'oc-drop-stub'
}

describe('ApplicationsMenu component', () => {
  jest
    .spyOn(ApplicationsMenu.mixins[0].methods, 'navigation_getMenuItems')
    .mockImplementation(() => [
      {
        iconMaterial: 'folder',
        iconUrl: undefined,
        title: 'Files',
        path: '/files'
      },
      {
        iconMaterial: 'some-icon',
        iconUrl: undefined,
        title: 'External',
        url: 'http://some.org',
        target: '_blank'
      }
    ])

  afterEach(() => {
    jest.clearAllMocks()
  })

  let wrapper
  beforeEach(() => {
    wrapper = getShallowWrapper(menuLinks)
  })

  it('should set aria-label prop on switcher button', () => {
    const appSwitcherButton = wrapper.find(selectors.appSwitcherButton)

    expect(appSwitcherButton).toMatchSnapshot()
  })
  it('should show app menus', () => {
    const ocDrop = wrapper.find(selectors.ocDrop)

    expect(ocDrop).toMatchSnapshot()
  })
})

function getShallowWrapper(applicationsList = []) {
  return shallowMount(ApplicationsMenu, {
    localVue,
    propsData: {
      applicationsList
    }
  })
}
