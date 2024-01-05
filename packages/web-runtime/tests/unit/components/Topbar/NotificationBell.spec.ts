import NotificationBell from 'web-runtime/src/components/Topbar/NotificationBell.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  mount
} from 'web-test-helpers/src'

describe('NotificationBell', () => {
  it('should match snapshot', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('should not render badge if 0 notifications', async () => {
    const { wrapper } = getWrapper({})
    await wrapper.setProps({ notificationCount: 0 })
    expect(wrapper.find('.badge').exists()).toBeFalsy()
  })
  it.each([
    [1, '1'],
    [11, '11'],
    [99, '99'],
    [110, '99+']
  ])("should render badge count '%s'", async (input, expected) => {
    const { wrapper } = getWrapper({})
    await wrapper.setProps({ notificationCount: input })
    expect(wrapper.find('.badge').text()).toBe(expected)
  })
  it('displays a tooltip with the notifications label', () => {
    const { wrapper } = getWrapper({
      mountType: mount,
      props: {
        notificationCount: 0
      }
    })
    expect(wrapper.find('#oc-notifications-bell').attributes('aria-label')).toEqual('Notifications')
  })
  it('animates when notification count changes', async () => {
    const { wrapper } = getWrapper({
      props: {
        notificationCount: 5
      }
    })
    wrapper.setProps({ notificationCount: 10 })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.shake').exists()).toBe(true)
  })
})
function getWrapper({ mountType = mount, mocks = {}, props = {} } = {}) {
  const localMocks = { ...defaultComponentMocks(), ...mocks }
  const storeOptions = {
    ...defaultStoreMockOptions
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
