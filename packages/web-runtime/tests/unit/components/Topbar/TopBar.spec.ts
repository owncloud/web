import { computed } from 'vue'
import TopBar from 'web-runtime/src/components/Topbar/TopBar.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'

const mockUseEmbedMode = jest.fn().mockReturnValue({ isEnabled: computed(() => false) })

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  useEmbedMode: jest.fn().mockImplementation(() => mockUseEmbedMode())
}))

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
  it.each(['applications-menu', 'theme-switcher', 'feedback-link', 'notifications', 'user-menu'])(
    'should hide %s when mode is "embed"',
    (componentName) => {
      mockUseEmbedMode.mockReturnValue({
        isEnabled: computed(() => true)
      })

      const { wrapper } = getWrapper()
      expect(wrapper.find(`${componentName}-stub`).exists()).toBeFalsy()
    }
  )
  it.each(['applications-menu', 'theme-switcher', 'feedback-link', 'notifications', 'user-menu'])(
    'should not hide %s when mode is not "embed"',
    (componentName) => {
      mockUseEmbedMode.mockReturnValue({
        isEnabled: computed(() => false)
      })

      const { wrapper } = getWrapper({
        capabilities: {
          notifications: { 'ocs-endpoints': ['list', 'get', 'delete'] }
        }
      })
      expect(wrapper.find(`${componentName}-stub`).exists()).toBeTruthy()
    }
  )
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
    options: { disableFeedbackLink: false }
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
        mocks,
        provide: mocks
      }
    })
  }
}
