import { mock, mockDeep } from 'jest-mock-extended'
import { unref } from 'vue'
import { useFileActionsMove } from 'web-app-files/src/composables'
import { Resource, SpaceResource } from 'web-client/src'
import { useStore } from 'web-pkg/src/composables'
import {
  RouteLocation,
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  getComposableWrapper
} from 'web-test-helpers/src'

describe('move', () => {
  describe('computed property "actions"', () => {
    describe('move isEnabled property of returned element', () => {
      it.each([
        {
          resources: [{ isReceivedShare: () => true, canBeDeleted: () => true }] as Resource[],
          expectedStatus: true
        },
        {
          resources: [
            { isReceivedShare: () => true, canBeDeleted: () => true, locked: true }
          ] as Resource[],
          expectedStatus: false
        }
      ])('should be set correctly', (inputData) => {
        const { wrapper } = getWrapper({
          setup: () => {
            const store = useStore()
            const { actions } = useFileActionsMove({ store })

            const resources = inputData.resources
            expect(unref(actions)[0].isEnabled({ space: null, resources })).toBe(
              inputData.expectedStatus
            )
          }
        })
      })
    })
  })
})
function getWrapper({
  setup
}: {
  setup: (
    instance: ReturnType<typeof useFileActionsMove>,
    {
      storeOptions
    }: {
      storeOptions: typeof defaultStoreMockOptions
    }
  ) => void
}) {
  const routeName = 'files-spaces-generic'
  const mocks = {
    ...defaultComponentMocks({ currentRoute: mock<RouteLocation>({ name: routeName }) }),
    space: mockDeep<SpaceResource>({
      webDavPath: 'irrelevant'
    })
  }

  const storeOptions = {
    ...defaultStoreMockOptions
  }
  storeOptions.modules.Files.getters.currentFolder.mockImplementation(() => mocks.space)
  const store = createStore(storeOptions)
  return {
    mocks,
    storeOptions,
    wrapper: getComposableWrapper(
      () => {
        const store = useStore()
        const instance = useFileActionsMove({ store })
        setup(instance, { storeOptions })
      },
      {
        mocks,
        provide: mocks,
        store
      }
    )
  }
}
