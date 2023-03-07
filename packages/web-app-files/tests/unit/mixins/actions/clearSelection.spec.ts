import { unref } from 'vue'
import { useClearSelection } from 'web-app-files/src/mixins/actions/clearSelection'
import { Resource } from 'web-client/src'
import { useStore } from 'web-pkg/src'
import { getComposableWrapper, defaultComponentMocks } from 'web-test-helpers'

describe('clearSelection', () => {
  describe('computed property "$_clearSelection_items"', () => {
    describe('isEnabled property of returned element', () => {
      it.each([
        { resources: [] as Resource[], expectedStatus: false },
        { resources: [{ id: 1 }] as Resource[], expectedStatus: true }
      ])('should be set correctly', (inputData) => {
        const { wrapper } = getWrapper({
          setup: () => {
            const store = useStore()
            const { actions } = useClearSelection({ store })

            const resources = inputData.resources
            expect(unref(actions)[0].isEnabled({ space: null, resources })).toBe(
              inputData.expectedStatus
            )
          }
        })
      })
    })
  })

  describe('method "$_clearSelection_trigger"', () => {
    it.skip('should trigger "RESET_SELECTION"', async () => {
      const { wrapper } = getWrapper({
        setup: () => {
          const store = useStore()
          const { actions } = useClearSelection({ store })

          // FIXME: needs to spy on the store
          // const spyCreateModalStub = jest.spyOn(wrapper.vm, 'RESET_SELECTION')
          // const resources = [{ id: 1 }]
          // await wrapper.vm.$_clearSelection_trigger({ resources })
          // expect(spyCreateModalStub).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})

function getWrapper({ setup }) {
  return {
    wrapper: getComposableWrapper(setup, {
      mocks: defaultComponentMocks()
    })
  }
}
