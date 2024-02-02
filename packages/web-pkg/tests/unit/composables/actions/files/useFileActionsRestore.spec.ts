import { useFileActionsRestore } from '../../../../../src/composables/actions'
import { createLocationTrash, createLocationSpaces } from '../../../../../src/router'
import { mock } from 'vitest-mock-extended'
import { defaultComponentMocks, getComposableWrapper, RouteLocation } from 'web-test-helpers'
import { useMessages, useResourcesStore } from '../../../../../src/composables/piniaStores'
import { unref } from 'vue'
import { Resource } from '@ownclouders/web-client'
import { ProjectSpaceResource, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { LoadingTaskCallbackArguments } from '../../../../../src/services/loadingService'
import { Drive } from '@ownclouders/web-client/src/generated'
import { AxiosResponse } from 'axios'

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

    it('should show message on error', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined)

      getWrapper({
        resolveClearTrashBin: false,
        setup: async ({ restoreResources }, { space }) => {
          await restoreResources(
            space,
            [{ id: '1', path: '/1' }],
            [],
            mock<LoadingTaskCallbackArguments>()
          )

          const { showErrorMessage } = useMessages()
          expect(showErrorMessage).toHaveBeenCalledTimes(1)

          const { removeResources } = useResourcesStore()
          expect(removeResources).toHaveBeenCalledTimes(0)
        }
      })
    })

    it('should request parent folder on collecting restore conflicts', () => {
      getWrapper({
        setup: async ({ collectConflicts }, { space, clientService }) => {
          const resource = { id: '1', path: '1', name: '1' } as Resource
          await collectConflicts(space, [resource])

          expect(clientService.webdav.listFiles).toHaveBeenCalledWith(expect.anything(), {
            path: '.'
          })
        }
      })
    })

    it('should find conflict within resources', () => {
      getWrapper({
        setup: async ({ collectConflicts }, { space }) => {
          const resourceOne = { id: '1', path: '1', name: '1' } as Resource
          const resourceTwo = { id: '2', path: '1', name: '1' } as Resource
          const { conflicts } = await collectConflicts(space, [resourceOne, resourceTwo])

          expect(conflicts).toContain(resourceTwo)
        }
      })
    })

    it('should add files without conflict to resolved resources', () => {
      getWrapper({
        setup: async ({ collectConflicts }, { space }) => {
          const resource = { id: '1', path: '1', name: '1' } as Resource
          const { resolvedResources } = await collectConflicts(space, [resource])

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
      clientService: ReturnType<typeof defaultComponentMocks>['$clientService']
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
  mocks.$clientService.graphAuthenticated.drives.getDrive.mockResolvedValue(
    mock<AxiosResponse>({ data: { value: mock<Drive>() } })
  )

  return {
    mocks,
    wrapper: getComposableWrapper(
      () => {
        const instance = useFileActionsRestore()
        setup(instance, {
          space: mocks.space,
          router: mocks.$router,
          clientService: mocks.$clientService
        })
      },
      {
        mocks,
        provide: mocks
      }
    )
  }
}
