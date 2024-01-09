import { useSpaceActionsRestore } from '../../../../../src/composables/actions/spaces'
import { buildSpace, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { mock } from 'jest-mock-extended'
import {
  createStore,
  defaultComponentMocks,
  mockAxiosResolve,
  defaultStoreMockOptions,
  RouteLocation,
  getComposableWrapper
} from 'web-test-helpers'
import { unref } from 'vue'
import { Drive } from '@ownclouders/web-client/src/generated'
import { useMessages, useModals } from '../../../../../src/composables/piniaStores'

describe('restore', () => {
  describe('isEnabled property', () => {
    it('should be false when no resource given', () => {
      getWrapper({
        setup: ({ actions }, { storeOptions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [] })).toBe(false)
        }
      })
    })
    it('should be false when the space is not disabled', () => {
      const spaceMock = mock<Drive>({
        id: '1',
        root: {
          permissions: [{ roles: ['manager'], grantedToIdentities: [{ user: { id: '1' } }] }]
        },
        driveType: 'project',
        special: null
      })
      getWrapper({
        setup: ({ actions }, { storeOptions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(false)
        }
      })
    })
    it('should be true when the space is disabled', () => {
      const spaceMock = mock<Drive>({
        id: '1',
        root: {
          permissions: [{ roles: ['manager'], grantedToIdentities: [{ user: { id: '1' } }] }],
          deleted: { state: 'trashed' }
        },
        driveType: 'project',
        special: null
      })
      getWrapper({
        setup: ({ actions }, { storeOptions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(true)
        }
      })
    })
    it('should be false when the current user is a viewer', () => {
      const spaceMock = mock<Drive>({
        id: '1',
        root: {
          permissions: [{ roles: ['viewer'], grantedToIdentities: [{ user: { id: '1' } }] }],
          deleted: { state: 'trashed' }
        },
        driveType: 'project',
        special: null
      })
      getWrapper({
        setup: ({ actions }, { storeOptions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(false)
        }
      })
    })
  })

  describe('handler', () => {
    it('should trigger the restore modal window', () => {
      getWrapper({
        setup: async ({ actions }, { storeOptions }) => {
          const { dispatchModal } = useModals()
          await unref(actions)[0].handler({
            resources: [
              mock<SpaceResource>({ id: '1', canRestore: () => true, driveType: 'project' })
            ]
          })

          expect(dispatchModal).toHaveBeenCalledTimes(1)
        }
      })
    })
    it('should not trigger the restore modal window without any resource', () => {
      getWrapper({
        setup: async ({ actions }, { storeOptions }) => {
          const { dispatchModal } = useModals()
          await unref(actions)[0].handler({
            resources: [mock<SpaceResource>({ id: '1', canRestore: () => false })]
          })

          expect(dispatchModal).toHaveBeenCalledTimes(0)
        }
      })
    })
  })

  describe('method "restoreSpace"', () => {
    it('should show message on success', () => {
      getWrapper({
        setup: async ({ restoreSpaces }, { clientService }) => {
          clientService.graphAuthenticated.drives.updateDrive.mockResolvedValue(mockAxiosResolve())
          await restoreSpaces([mock<SpaceResource>({ id: '1', canRestore: () => true })])

          const { showMessage } = useMessages()
          expect(showMessage).toHaveBeenCalledTimes(1)
        }
      })
    })

    it('should show message on error', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      getWrapper({
        setup: async ({ restoreSpaces }, { clientService }) => {
          clientService.graphAuthenticated.drives.updateDrive.mockRejectedValue(new Error())
          await restoreSpaces([mock<SpaceResource>({ id: '1', canRestore: () => true })])

          const { showErrorMessage } = useMessages()
          expect(showErrorMessage).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (
    instance: ReturnType<typeof useSpaceActionsRestore>,
    {
      storeOptions,
      clientService
    }: {
      storeOptions: typeof defaultStoreMockOptions
      clientService: ReturnType<typeof defaultComponentMocks>['$clientService']
    }
  ) => void
}) {
  const storeOptions = {
    ...defaultStoreMockOptions
  }
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks({
    currentRoute: mock<RouteLocation>({ name: 'files-spaces-projects' })
  })
  return {
    mocks,
    wrapper: getComposableWrapper(
      () => {
        const instance = useSpaceActionsRestore({ store })
        setup(instance, { storeOptions, clientService: mocks.$clientService })
      },
      {
        mocks,
        provide: mocks,
        store,
        pluginOptions: {
          piniaOptions: { userState: { user: { id: '1', onPremisesSamAccountName: 'alice' } } }
        }
      }
    )
  }
}
