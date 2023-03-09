import TopBar from 'web-runtime/src/components/Topbar/TopBar.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'

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
    expect(wrapper.find('applications-menu-stub').exists()).toBeTruthy()
  })
  describe('notifications bell', () => {
    it('should display in authenticated context if announced via capabilities', () => {
      const { wrapper } = getWrapper({
        capabilities: {
          notifications: { 'ocs-endpoints': ['list', 'get', 'delete'] }
        }
      })
      expect(wrapper.find('notifications-stub').exists()).toBeTruthy()
    })
    it('should not display in an unauthenticated context', () => {
      const { wrapper } = getWrapper({
        isUserContextReady: false,
        capabilities: {
          notifications: { 'ocs-endpoints': ['list', 'get', 'delete'] }
        }
      })
      expect(wrapper.find('notifications-stub').exists()).toBeFalsy()
    })
    it('should not display if capability is missing', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.find('notifications-stub').exists()).toBeFalsy()
    })
    it('should not display if endpoint list is missing', () => {
      const { wrapper } = getWrapper({
        capabilities: { notifications: { 'ocs-endpoints': [] } }
      })
      expect(wrapper.find('notifications-stub').exists()).toBeFalsy()
    })
  })
})

const getWrapper = ({ capabilities = {}, isUserContextReady = true } = {}) => {
  const mocks = { ...defaultComponentMocks() }
  const storeOptions = {
    ...defaultStoreMockOptions,
    getters: {
      ...defaultStoreMockOptions.getters,
      capabilities: () => capabilities
    }
  }
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
  storeOptions.modules.runtime.modules.auth.getters.isUserContextReady.mockReturnValue(
    isUserContextReady
  )
  const store = createStore(storeOptions)
  return {
    wrapper: shallowMount(TopBar, {
      props: {
        applicationsList: ['testApp']
      },
      global: {
        plugins: [...defaultPlugins(), store],
        stubs: { 'router-link': true, 'portal-target': true, notifications: true },
        mocks
      }
    })
  }
}
