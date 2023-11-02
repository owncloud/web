import { mock } from 'jest-mock-extended'
import { unref } from 'vue'
import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  RouteLocation,
  getComposableWrapper
} from 'web-test-helpers'
import { useFileActionsCreateNewShortcut } from '../../../../../src'
import { Resource } from '@ownclouders/web-client'

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
      it('sets property "modalOpen" to true', () => {
        getWrapper({
          setup: ({ actions, modalOpen }) => {
            unref(actions)[0].handler()
            expect(unref(modalOpen)).toBe(true)
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
        const instance = useFileActionsCreateNewShortcut({ store })
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
