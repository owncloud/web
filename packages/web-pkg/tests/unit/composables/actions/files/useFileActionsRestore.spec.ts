import { useFileActionsRestore } from '../../../../../src/composables/actions'
import { createLocationTrash, createLocationSpaces } from '../../../../../src/router'
import { mock } from 'jest-mock-extended'
import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  getComposableWrapper,
  RouteLocation
} from 'web-test-helpers'
import { useStore } from '../../../../../src/composables'
import { unref } from 'vue'
import { Resource } from '@ownclouders/web-client'
import { ProjectSpaceResource, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { LoadingTaskCallbackArguments } from '../../../../../src/services/loadingService'

describe('restore', () => {
  afterEach(() => jest.clearAllMocks())

  describe('isEnabled property', () => {
    it('should be false when no resource is given', () => {
      const { wrapper } = getWrapper({
        setup: ({ actions }, { space }) => {
          expect(
            unref(actions)[0].isEnabled({
              space,
              resources: [] as Resource[]
            })
          ).toBe(false)
        }
      })
    })
    it('should be true when permission is sufficient', () => {
      const { wrapper } = getWrapper({
        setup: ({ actions }, { space }) => {
          expect(
            unref(actions)[0].isEnabled({
              space,
              resources: [{ canBeRestored: () => true }] as Resource[]
            })
          ).toBe(true)
        }
      })
    })
    it('should be false when permission is not sufficient', () => {
      const { wrapper } = getWrapper({
        setup: ({ actions }, { space }) => {
          expect(
            unref(actions)[0].isEnabled({
              space,
              resources: [{ canBeRestored: () => false }] as Resource[]
            })
          ).toBe(false)
        }
      })
    })
    it('should be false when location is invalid', () => {
      const { wrapper } = getWrapper({
        invalidLocation: true,
        setup: ({ actions }, { space }) => {
          expect(unref(actions)[0].isEnabled({ space, resources: [{}] as Resource[] })).toBe(false)
        }
      })
    })
    it('should be false in a space trash bin with insufficient permissions', () => {
      const { wrapper, mocks } = getWrapper({
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

  describe('method "restoreResources"', () => {
    it('should show message on success', () => {
      const { wrapper } = getWrapper({
        setup: async ({ restoreResources }, { space, storeOptions }) => {
          await restoreResources(
            space,
            [{ id: '1', path: '/1' }],
            [],
            mock<LoadingTaskCallbackArguments>()
          )

          expect(storeOptions.actions.showMessage).toHaveBeenCalledTimes(1)
          expect(storeOptions.modules.Files.actions.removeFilesFromTrashbin).toHaveBeenCalledTimes(
            1
          )
        }
      })
    })

    it.skip('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)

      const { wrapper } = getWrapper({
        resolveClearTrashBin: false,
        setup: async ({ actions }) => {
          const showErrorMessageStub = jest.spyOn(wrapper.vm, 'showErrorMessage')
          const removeFilesFromTrashbinStub = jest.spyOn(wrapper.vm, 'removeFilesFromTrashbin')
          await wrapper.vm.$_restore_restoreResources([{ id: '1', path: '/1' }], [])

          expect(showErrorMessageStub).toHaveBeenCalledTimes(1)
          expect(removeFilesFromTrashbinStub).toHaveBeenCalledTimes(0)
        }
      })
    })
    it.skip('should request parent folder on collecting restore conflicts', async () => {
      const { wrapper } = getWrapper({
        setup: async ({ actions }) => {
          await wrapper.vm.$_restore_collectConflicts([{ id: '1', path: '1', name: '1' }])

          expect(wrapper.vm.$clientService.webdav.listFiles).toHaveBeenCalledWith(
            expect.anything(),
            {
              path: '.'
            }
          )
        }
      })
    })
    it.skip('should find conflict within resources', async () => {
      const { wrapper } = getWrapper({
        setup: async ({ actions }) => {
          const resourceOne = { id: '1', path: '1', name: '1' }
          const resourceTwo = { id: '2', path: '1', name: '1' }
          const { conflicts } = await wrapper.vm.$_restore_collectConflicts([
            resourceOne,
            resourceTwo
          ])

          expect(conflicts).toContain(resourceTwo)
        }
      })
    })
    it.skip('should add files without conflict to resolved resources', async () => {
      const { wrapper } = getWrapper({
        setup: async ({ actions }) => {
          const resource = { id: '1', path: '1', name: '1' }
          const { resolvedResources } = await wrapper.vm.$_restore_collectConflicts([resource])

          expect(resolvedResources).toContain(resource)
        }
      })
    })
  })
})

function getWrapper({
  invalidLocation = false,
  resolveClearTrashBin: resolveRestore = true,
  driveType = 'personal',
  setup
}: {
  invalidLocation?: boolean
  resolveClearTrashBin?: boolean
  driveType?: string
  setup: (
    instance: ReturnType<typeof useFileActionsRestore>,
    {
      space,
      storeOptions
    }: {
      space: SpaceResource
      storeOptions: typeof defaultStoreMockOptions
      router: ReturnType<typeof defaultComponentMocks>['$router']
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
    space: mock<ProjectSpaceResource>({
      driveType,
      isEditor: () => false,
      isManager: () => false
    })
  }
  mocks.$clientService.webdav.listFiles.mockImplementation(() => {
    return Promise.resolve({ resource: mock<Resource>(), children: [] })
  })
  if (resolveRestore) {
    mocks.$clientService.webdav.restoreFile.mockResolvedValue(undefined)
  } else {
    mocks.$clientService.webdav.restoreFile.mockRejectedValue(new Error(''))
  }
  mocks.$clientService.owncloudSdk.users.getUser.mockImplementation(() => ({ quota: {} }))

  const storeOptions = {
    ...defaultStoreMockOptions,
    modules: {
      ...defaultStoreMockOptions.modules,
      user: { state: { uuid: 1 } }
    }
  }
  const store = createStore(storeOptions)
  return {
    mocks,
    wrapper: getComposableWrapper(
      () => {
        const store = useStore()
        const instance = useFileActionsRestore({ store })
        setup(instance, { space: mocks.space, storeOptions, router: mocks.$router })
      },
      {
        mocks,
        provide: mocks,
        store
      }
    )
  }
}
