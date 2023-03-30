import { useSpaceHelpers } from 'web-pkg/src/composables'
import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  getComposableWrapper
} from 'web-test-helpers'
import { SpaceResource } from 'web-client'
import { useFileActionsSetReadme } from 'web-pkg/src/composables/actions'
import { unref } from 'vue'

describe('useCapability', () => {
  it('should be valid', () => {
    expect(useSpaceHelpers).toBeDefined()
  })
  describe('method "checkName"', () => {
    it('should not show an error message with a valid space name', () => {
      const { checkSpaceNameModalInput } = useSpaceHelpers()
      checkSpaceNameModalInput('Space')

      const { wrapper } = getWrapper({
        setup: ({ actions }) => {
          expect(
            unref(actions)[0].isEnabled({
              space,
              resources: [{ id: 1, mimeType: 'text/plain' }] as SpaceResource[]
            })
          ).toBe(false)
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (
    instance: ReturnType<typeof useFileActionsSetReadme>,
    options: { storeOptions: typeof defaultStoreMockOptions }
  ) => void
}) {
  const mocks = {
    ...defaultComponentMocks({})
  }

  const storeOptions = {
    ...defaultStoreMockOptions
  }

  const store = createStore(storeOptions)
  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useSpaceHelpers()
        setup(instance, { storeOptions })
      },
      {
        store,
        mocks
      }
    )
  }
}
