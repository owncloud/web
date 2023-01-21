import clearSelection from 'web-app-files/src/mixins/actions/clearSelection'
import { createStore, defaultPlugins, mount, defaultStoreMockOptions } from 'web-test-helpers'

const Component = {
  template: '<div></div>',
  mixins: [clearSelection]
}

describe('clearSelection', () => {
  describe('computed property "$_clearSelection_items"', () => {
    describe('isEnabled property of returned element', () => {
      it.each([
        { resources: [], expectedStatus: false },
        { resources: [{ id: 1 }], expectedStatus: true }
      ])('should be set correctly', (inputData) => {
        const { wrapper } = getWrapper()
        const resources = inputData.resources
        expect(wrapper.vm.$_clearSelection_items[0].isEnabled({ resources })).toBe(
          inputData.expectedStatus
        )
      })
    })
  })

  describe('method "$_clearSelection_trigger"', () => {
    it('should trigger "RESET_SELECTION"', async () => {
      const { wrapper } = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'RESET_SELECTION')
      const resources = [{ id: 1 }]
      await wrapper.vm.$_clearSelection_trigger({ resources })
      expect(spyCreateModalStub).toHaveBeenCalledTimes(1)
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
