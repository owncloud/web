import { useFileActionsEmptyTrashBin } from 'web-pkg/src/composables/actions/files/useFileActionsEmptyTrashBin'
import { createLocationTrash, createLocationSpaces } from 'web-pkg/src/router'
import { mock } from 'jest-mock-extended'
import {
  createStore,
  defaultStoreMockOptions,
  getComposableWrapper,
  defaultComponentMocks,
  RouteLocation
} from 'web-test-helpers'
import { useStore } from 'web-pkg/src/composables'
import { unref } from 'vue'
import { ProjectSpaceResource, Resource } from 'web-client/src/helpers'
import { FileActionOptions } from 'web-pkg/src/composables/actions'

describe('emptyTrashBin', () => {
  afterEach(() => jest.clearAllMocks())

  describe('isEnabled property', () => {
    it('should be false when location is invalid', () => {
      const { wrapper } = getWrapper({
        invalidLocation: true,
        setup: ({ actions }, { space }) => {
          expect(unref(actions)[0].isEnabled({ space, resources: [] })).toBe(false)
        }
      })
    })
    it('should be false in a space trash bin with insufficient permissions', () => {
      const { wrapper } = getWrapper({
        driveType: 'project',
        setup: ({ actions }, { space }) => {
          expect(
            unref(actions)[0].isEnabled({
              space,
              resources: [{ canBeRestored: () => true }] as Resource[]
            })
          ).toBe(false)
        }
      })
    })
  })

  describe('empty trashbin action', () => {
    it('should trigger the empty trash bin modal window', async () => {
      const { wrapper } = getWrapper({
        setup: async ({ actions }, { storeOptions }) => {
          await unref(actions)[0].handler(mock<FileActionOptions>())

          expect(storeOptions.actions.createModal).toHaveBeenCalledTimes(1)
        }
      })
    })
  })

  describe('method "emptyTrashBin"', () => {
    it('should hide the modal and show message on success', async () => {
      const { wrapper } = getWrapper({
        setup: async ({ emptyTrashBin }, { space, storeOptions }) => {
          await emptyTrashBin({ space })

          expect(storeOptions.actions.hideModal).toHaveBeenCalledTimes(1)
          expect(storeOptions.actions.showMessage).toHaveBeenCalledTimes(1)
        }
      })
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)

      const { wrapper } = getWrapper({
        resolveClearTrashBin: false,
        setup: async ({ emptyTrashBin }, { space, storeOptions }) => {
          await emptyTrashBin({ space })

          expect(storeOptions.actions.showErrorMessage).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})

function getWrapper({
  invalidLocation = false,
  resolveClearTrashBin = true,
  driveType = 'personal',
  setup
}: {
  invalidLocation?: boolean
  resolveClearTrashBin?: boolean
  driveType?: string
  setup: (
    instance: ReturnType<typeof useFileActionsEmptyTrashBin>,
    {
      space,
      storeOptions
    }: {
      space: ProjectSpaceResource
      storeOptions: typeof defaultStoreMockOptions
    }
  ) => void
}) {
  const mocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>(
        invalidLocation
          ? (createLocationSpaces('files-spaces-generic') as any)
          : (createLocationTrash('files-trash-generic') as any)
      )
    }),
    space: mock<ProjectSpaceResource>({ driveType, isEditor: () => false, isManager: () => false })
  }

  if (resolveClearTrashBin) {
    mocks.$clientService.webdav.clearTrashBin.mockResolvedValue()
  } else {
    mocks.$clientService.webdav.clearTrashBin.mockRejectedValue(new Error(''))
  }

  const storeOptions = {
    ...defaultStoreMockOptions,
    modules: {
      ...defaultStoreMockOptions.modules,
      user: { state: { uuid: 1 } }
    }
  }
  const store = createStore(storeOptions)
  return {
    wrapper: getComposableWrapper(
      () => {
        const store = useStore()
        const instance = useFileActionsEmptyTrashBin({ store })
        setup(instance, { space: mocks.space, storeOptions })
      },
      {
        mocks,
        provide: mocks,
        store
      }
    )
  }
}
