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
  internalMenuLink: '.apps-menu-internal-link',
  internalMenuIcon: '.apps-menu-internal-link oc-icon-stub',
  externalMenuLink: '.apps-menu-external-link',
  externalMenuIcon: '.apps-menu-external-link oc-icon-stub'
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

  it('shoud set aria-label prop on switcher button', () => {
    const appSwitcherButton = wrapper.find(selectors.appSwitcherButton)

    expect(wrapper.exists()).toBeTruthy()
    expect(appSwitcherButton.props().ariaLabel).toEqual('Application Switcher')
  })
  it('should show app menus', () => {
    // internal menu
    const internalMenuLink = wrapper.find(selectors.internalMenuLink)
    const internalMenuIcon = wrapper.find(selectors.internalMenuIcon)

    expect(internalMenuLink.props().to).toEqual('/files')
    expect(internalMenuIcon.props().name).toEqual(menuLinks[0].icon)
    expect(internalMenuLink.text()).toEqual(menuLinks[0].name)

    // external menu
    const externalMenuLink = wrapper.find(selectors.externalMenuLink)
    const externalMenuIcon = wrapper.find(selectors.externalMenuIcon)

    expect(externalMenuLink.attributes().target).toEqual('_blank')
    expect(externalMenuLink.attributes().href).toEqual(menuLinks[1].url)
    expect(externalMenuIcon.props().name).toEqual(menuLinks[1].icon)
    expect(externalMenuLink.text()).toEqual(menuLinks[1].name)
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
