import { useFileActionsRestore } from '../../../../../src/composables/actions'
import { createLocationTrash, createLocationSpaces } from '../../../../../src/router'
import { mock } from 'vitest-mock-extended'
import { defaultComponentMocks, getComposableWrapper, RouteLocation } from 'web-test-helpers'
import { useMessages, useResourcesStore } from '../../../../../src/composables/piniaStores'
import { unref } from 'vue'
import { Resource } from '@ownclouders/web-client'
import { ProjectSpaceResource, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { LoadingTaskCallbackArguments } from '../../../../../src/services/loadingService'

describe('restore', () => {
  describe('isEnabled property', () => {
    it('should be false when no resource is given', () => {
      getWrapper({
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
      getWrapper({
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
      getWrapper({
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
      getWrapper({
        invalidLocation: true,
        setup: ({ actions }, { space }) => {
          expect(unref(actions)[0].isEnabled({ space, resources: [{}] as Resource[] })).toBe(false)
        }
      })
    })
    it('should be false in a space trash bin with insufficient permissions', () => {
      getWrapper({
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
      getWrapper({
        setup: async ({ restoreResources }, { space }) => {
          await restoreResources(
            space,
            [{ id: '1', path: '/1' }],
            [],
            mock<LoadingTaskCallbackArguments>()
          )

          const { showMessage } = useMessages()
          expect(showMessage).toHaveBeenCalledTimes(1)

          const { removeResources, resetSelection } = useResourcesStore()
          expect(removeResources).toHaveBeenCalledTimes(1)
          expect(resetSelection).toHaveBeenCalledTimes(1)
        }
      })
    })

    it.skip('should show message on error', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined)

      const { wrapper } = getWrapper({
        resolveClearTrashBin: false,
        setup: async () => {
          const showErrorMessageStub = vi.spyOn(wrapper.vm, 'showErrorMessage')
          const removeFilesFromTrashbinStub = vi.spyOn(wrapper.vm, 'removeFilesFromTrashbin')
          await wrapper.vm.$_restore_restoreResources([{ id: '1', path: '/1' }], [])

          expect(showErrorMessageStub).toHaveBeenCalledTimes(1)
          expect(removeFilesFromTrashbinStub).toHaveBeenCalledTimes(0)
        }
      })
    })

    it.skip('should request parent folder on collecting restore conflicts', () => {
      const { wrapper } = getWrapper({
        setup: async () => {
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

    it.skip('should find conflict within resources', () => {
      const { wrapper } = getWrapper({
        setup: async () => {
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

    it.skip('should add files without conflict to resolved resources', () => {
      const { wrapper } = getWrapper({
        setup: async () => {
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
      space
    }: {
      space: SpaceResource
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

  return {
    mocks,
    wrapper: getComposableWrapper(
      () => {
        const instance = useFileActionsRestore()
        setup(instance, { space: mocks.space, router: mocks.$router })
      },
      {
        mocks,
        provide: mocks
      }
    )
  }
}
