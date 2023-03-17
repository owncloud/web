import { unref } from 'vue'
import { useFileActionsClearSelection } from 'web-app-files/src/composables/actions/files/useFileActionsClearSelection'
import { Resource } from 'web-client'
import { useStore } from 'web-pkg/src/composables'
import {
  getComposableWrapper,
  defaultComponentMocks,
  defaultStoreMockOptions,
  createStore
} from 'web-test-helpers'

describe('clearSelection', () => {
  describe('computed property "actions"', () => {
    describe('isEnabled property of returned element', () => {
      it.each([
        { resources: [] as Resource[], expectedStatus: false },
        { resources: [{ id: 1 }] as Resource[], expectedStatus: true }
      ])('should be set correctly', (inputData) => {
        const { wrapper } = getWrapper({
          setup: ({ actions }) => {
            const resources = inputData.resources
            expect(unref(actions)[0].isEnabled({ space: null, resources })).toBe(
              inputData.expectedStatus
            )
          }
        })
      })
    })
  })

  describe('clear selection action', () => {
    it('should trigger "RESET_SELECTION"', async () => {
      const { wrapper } = getWrapper({
        setup: async ({ actions }, storeOptions) => {
          const resources = [{ id: 1 }] as Resource[]
          await unref(actions)[0].handler({ space: null, resources })
          expect(storeOptions.modules.Files.mutations.RESET_SELECTION).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (
    instance: ReturnType<typeof useFileActionsClearSelection>,
    options: typeof defaultStoreMockOptions
  ) => void
}) {
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  return {
    wrapper: getComposableWrapper(
      () => {
        const store = useStore()
        const instance = useFileActionsClearSelection({ store })
        setup(instance, storeOptions)
      },
      {
        mocks: defaultComponentMocks(),
        store
      }
    )
  }
}
