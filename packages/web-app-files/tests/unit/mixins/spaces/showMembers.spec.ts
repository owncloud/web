import ShowMembers from 'web-app-files/src/mixins/spaces/actions/showMembers.js'
import { createStore, defaultPlugins, mount, defaultStoreMockOptions } from 'web-test-helpers'

const Component = {
  template: '<div></div>',
  mixins: [ShowMembers]
}

describe('showMembers', () => {
  describe('isEnabled property', () => {
    it('should be false when no resource given', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_showMembers_items[0].isEnabled({ resources: [] })).toBe(false)
    })
    it('should be true when a resource is given', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_showMembers_items[0].isEnabled({ resources: [{ id: 1 }] })).toBe(true)
    })
  })
})

function getWrapper() {
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  return {
    wrapper: mount(Component, {
      global: {
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
