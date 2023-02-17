import NotificationBell from 'web-runtime/src/components/Topbar/NotificationBell.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  mount
} from 'web-test-helpers/src'

describe('NotificationBell', () => {
  it('should match snapshot', async () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('should not render badge if 0 notifications', async () => {
    const { wrapper } = getWrapper({
      capabilities: {
        notifications: {
          'ocs-endpoints': ['list', 'get', 'delete']
        }
      }
    })
    await wrapper.setProps({ notificationCount: 0 })
    expect(wrapper.find('.badge').exists()).toBeFalsy()
  })
  it.each([
    [1, '1'],
    [11, '11'],
    [99, '99'],
    [110, '99+']
  ])("should render badge count '%s'", async (input, expected) => {
    const { wrapper } = getWrapper({
      capabilities: {
        notifications: {
          'ocs-endpoints': ['list', 'get', 'delete']
        }
      }
    })
    await wrapper.setProps({ notificationCount: input })
    expect(wrapper.find('.badge').text()).toBe(expected)
  })
})
function getWrapper({ mountType = mount, capabilities = {}, mocks = {} } = {}) {
  const localMocks = { ...defaultComponentMocks(), ...mocks }
  const storeOptions = {
    ...defaultStoreMockOptions,
    capabilities: () => capabilities
  }
  const store = createStore(storeOptions)
  return {
    mocks: localMocks,
    storeOptions,
    wrapper: mountType(NotificationBell, {
      global: {
        renderStubDefaultSlot: true,
        plugins: [...defaultPlugins(), store],
        mocks: localMocks,
        stubs: { 'oc-icon': true }
      }
    })
  }
}
