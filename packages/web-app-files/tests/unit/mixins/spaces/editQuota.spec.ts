import EditQuota from 'web-app-files/src/mixins/spaces/actions/editQuota.js'
import { buildSpace } from 'web-client/src/helpers'
import { createStore, defaultPlugins, mount, defaultStoreMockOptions } from 'web-test-helpers'

const Component = {
  template: '<div></div>',
  mixins: [EditQuota]
}

describe('editQuota', () => {
  afterEach(() => jest.clearAllMocks())

  describe('isEnabled property', () => {
    it('should be false when not resource given', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_editQuota_items[0].isEnabled({ resources: [] })).toBe(false)
    })
    it('should be true when the current user has the "set-space-quota"-permission', () => {
      const spaceMock = {
        id: '1',
        quota: {},
        root: {
          permissions: [{ roles: ['manager'], grantedTo: [{ user: { id: 1 } }] }]
        }
      }
      const { wrapper } = getWrapper({ canEditSpaceQuota: true })
      expect(
        wrapper.vm.$_editQuota_items[0].isEnabled({ resources: [buildSpace(spaceMock)] })
      ).toBe(true)
    })
    it('should be false when the current user does not have the "set-space-quota"-permission', () => {
      const spaceMock = {
        id: '1',
        quota: {},
        root: {
          permissions: [{ roles: ['manager'], grantedTo: [{ user: { id: 1 } }] }]
        }
      }
      const { wrapper } = getWrapper({ canEditSpaceQuota: false })
      expect(
        wrapper.vm.$_editQuota_items[0].isEnabled({ resources: [buildSpace(spaceMock)] })
      ).toBe(false)
    })
  })
})

function getWrapper({ canEditSpaceQuota = false } = {}) {
  const storeOptions = {
    ...defaultStoreMockOptions,
    modules: { ...defaultStoreMockOptions.modules, user: { state: { id: 'alice', uuid: 1 } } }
  }
  const store = createStore(storeOptions)
  return {
    wrapper: mount(Component, {
      global: {
        plugins: [...defaultPlugins(), store],
        mocks: {
          $permissionManager: {
            canEditSpaceQuota: () => canEditSpaceQuota
          }
        }
      }
    })
  }
}
