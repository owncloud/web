import TopBar from 'web-runtime/src/components/Topbar/TopBar.vue'
import stubs from '../../../../../../tests/unit/stubs'
import { createStore, defaultComponentMocks, defaultPlugins, shallowMount } from 'web-test-helpers'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'

jest.spyOn((TopBar as any).mixins[0].methods, 'navigation_getMenuItems').mockImplementation(() => [
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

describe('Top Bar component', () => {
  it('Displays applications menu', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html().indexOf('applications-menu-stub')).toBeGreaterThan(-1)
    expect(wrapper).toMatchSnapshot()
  })
})

const getWrapper = () => {
  const mocks = { ...defaultComponentMocks() }
  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.configuration.mockImplementation(() => ({
    options: { disableFeedbackLink: false },
    themes: {
      default: {},
      'default-dark': {}
    },
    currentTheme: {
      logo: {
        topbar: 'example-logo.svg'
      }
    }
  }))
  storeOptions.getters.user.mockImplementation(() => ({ id: 'einstein' }))
  const store = createStore(storeOptions)
  return {
    wrapper: shallowMount(TopBar, {
      props: {
        applicationsList: ['testApp']
      },
      global: {
        plugins: [...defaultPlugins(), store],
        stubs,
        mocks
      }
    })
  }
}
