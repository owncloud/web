import { mock } from 'jest-mock-extended'
import { unref } from 'vue'
import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  RouteLocation,
  getComposableWrapper
} from 'web-test-helpers'
import { useFileActionsCreateNewShortcut, useModals } from '../../../../../src'
import { Resource, SpaceResource } from '@ownclouders/web-client'

describe('createNewShortcut', () => {
  describe('computed property "actions"', () => {
    describe('method "isEnabled"', () => {
      it.each([
        {
          currentFolderCanCreate: true,
          expectedStatus: true
        },
        {
          currentFolderCanCreate: false,
          expectedStatus: false
        }
      ])('should be set correctly', ({ currentFolderCanCreate, expectedStatus }) => {
        getWrapper({
          currentFolder: mock<Resource>({ canCreate: () => currentFolderCanCreate }),
          setup: ({ actions }) => {
            expect(unref(actions)[0].isEnabled()).toBe(expectedStatus)
          }
        })
      })
    })
    describe('method "handler"', () => {
      it('creates a modal', () => {
        getWrapper({
          setup: async ({ actions }) => {
            const { registerModal } = useModals()
            await unref(actions)[0].handler()
            expect(registerModal).toHaveBeenCalled()
          }
        })
      })
    })
  })
})

function getWrapper({
  setup,
  currentFolder = mock<Resource>()
}: {
  setup: (
    instance: ReturnType<typeof useFileActionsCreateNewShortcut>,
    options: {
      storeOptions: typeof defaultStoreMockOptions
    }
  ) => void
  currentFolder?: Resource
}) {
  const mocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ name: 'files-spaces-generic' })
    })
  }

  const storeOptions = {
    ...defaultStoreMockOptions
  }
  storeOptions.modules.Files.getters.currentFolder.mockReturnValue(currentFolder)

  const store = createStore(storeOptions)

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useFileActionsCreateNewShortcut({ space: mock<SpaceResource>() })
        setup(instance, { storeOptions })
      },
      {
        store,
        mocks,
        provide: mocks
      }
    )
  }
}
