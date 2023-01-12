import Navigate from 'web-pkg/src/mixins/spaces/navigate'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  mount,
  defaultStoreMockOptions
} from 'web-test-helpers'

const Component = {
  template: '<div></div>',
  mixins: [Navigate]
}

describe('navigate', () => {
  afterEach(() => jest.clearAllMocks())

  describe('isEnabled property', () => {
    it('should be true when no resource given', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_navigate_space_items[0].isEnabled({ resources: [] })).toBe(true)
    })
    it('should be false when resource is given', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_navigate_space_items[0].isEnabled({ resources: [{}] })).toBe(false)
    })
    it('should be false when location is invalid', () => {
      const { wrapper } = getWrapper({ invalidLocation: true })
      expect(wrapper.vm.$_navigate_space_items[0].isEnabled({ resources: [] })).toBe(false)
    })
  })

  describe('method "$_navigate_space_trigger"', () => {
    it('should trigger route change', async () => {
      const { wrapper } = getWrapper()
      await wrapper.vm.$_navigate_space_trigger()

      expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
        name: 'files-spaces-generic',
        params: {
          driveAliasAndItem: 'project/mars'
        }
      })
    })
  })
})

function getWrapper({ invalidLocation = false } = {}) {
  const currentRoute = { name: '', params: { driveAliasAndItem: '' } }
  if (invalidLocation) {
    currentRoute.name = 'files-spaces-generic'
  } else {
    currentRoute.name = 'files-trash-generic'
    currentRoute.params.driveAliasAndItem = 'project/mars'
  }
  const mocks = {
    ...defaultComponentMocks({ currentRoute }),
    space: {
      driveType: 'project',
      driveAlias: 'project/mars',
      getDriveAliasAndItem: () => 'project/mars'
    }
  }
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  return {
    wrapper: mount(Component, {
      global: {
        plugins: [...defaultPlugins(), store],
        mocks
      }
    })
  }
}
