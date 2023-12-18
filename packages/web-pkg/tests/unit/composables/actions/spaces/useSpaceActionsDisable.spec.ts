import { useSpaceActionsDisable } from '../../../../../src/composables/actions/spaces'
import { useModals } from '../../../../../src/composables/piniaStores'
import { buildSpace, SpaceResource } from '@ownclouders/web-client/src/helpers'
import {
  createStore,
  defaultComponentMocks,
  mockAxiosResolve,
  defaultStoreMockOptions,
  RouteLocation,
  getComposableWrapper
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { unref } from 'vue'
import { Drive } from '@ownclouders/web-client/src/generated'

describe('disable', () => {
  describe('isEnabled property', () => {
    it('should be false when no resource given', () => {
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [] })).toBe(false)
        }
      })
    })
    it('should be true when the space is not disabled', () => {
      const spaceMock = mock<Drive>({
        id: '1',
        root: {
          permissions: [{ roles: ['manager'], grantedToIdentities: [{ user: { id: '1' } }] }]
        },
        driveType: 'project',
        special: null
      })
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(true)
        }
      })
    })
    it('should be false when the space is disabled', () => {
      const spaceMock = mock<Drive>({
        id: '1',
        root: {
          permissions: [{ roles: ['manager'], grantedToIdentities: [{ user: { id: '1' } }] }],
          deleted: { state: 'trashed' }
        },
        special: null
      })
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(false)
        }
      })
    })
    it('should be false when current user is a viewer', () => {
      const spaceMock = mock<Drive>({
        id: '1',
        root: {
          permissions: [{ roles: ['viewer'], grantedToIdentities: [{ user: { id: '1' } }] }]
        },
        driveType: 'project',
        special: null
      })
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(false)
        }
      })
    })
  })

  describe('handler', () => {
    it('should trigger the disable modal window', () => {
      getWrapper({
        setup: async ({ actions }, { storeOptions }) => {
          const { registerModal } = useModals()
          await unref(actions)[0].handler({
            resources: [
              mock<SpaceResource>({ id: '1', canDisable: () => true, driveType: 'project' })
            ]
          })

          expect(registerModal).toHaveBeenCalledTimes(1)
        }
      })
    })
    it('should not trigger the disable modal window without any resource', () => {
      getWrapper({
        setup: async ({ actions }, { storeOptions }) => {
          const { registerModal } = useModals()
          await unref(actions)[0].handler({
            resources: [
              mock<SpaceResource>({ id: '1', canDisable: () => false, driveType: 'project' })
            ]
          })

          expect(registerModal).toHaveBeenCalledTimes(0)
        }
      })
    })
  })

  describe('method "disableSpace"', () => {
    it('should show message on success', () => {
      getWrapper({
        setup: async ({ disableSpaces }, { storeOptions, clientService }) => {
          clientService.graphAuthenticated.drives.disableDrive.mockResolvedValue(mockAxiosResolve())
          await disableSpaces([
            mock<SpaceResource>({ id: '1', canDisable: () => true, driveType: 'project' })
          ])

          expect(storeOptions.actions.showMessage).toHaveBeenCalledTimes(1)
        }
      })
    })

    it('should show message on error', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      getWrapper({
        setup: async ({ disableSpaces }, { storeOptions, clientService }) => {
          clientService.graphAuthenticated.drives.disableDrive.mockRejectedValue(new Error())
          await disableSpaces([
            mock<SpaceResource>({ id: '1', canDisable: () => true, driveType: 'project' })
          ])

          expect(storeOptions.actions.showErrorMessage).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (
    instance: ReturnType<typeof useSpaceActionsDisable>,
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
  storeOptions.getters.user.mockReturnValue({ id: 'alice', uuid: 1 })

  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks({
    currentRoute: mock<RouteLocation>({ name: 'files-spaces-projects' })
  })
  return {
    mocks,
    wrapper: getComposableWrapper(
      () => {
        const instance = useSpaceActionsDisable({ store })
        setup(instance, { storeOptions, clientService: mocks.$clientService })
      },
      {
        mocks,
        provide: mocks,
        store
      }
    )
  }
}
