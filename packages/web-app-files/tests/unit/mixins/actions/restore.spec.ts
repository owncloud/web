import { useRestore } from 'web-app-files/src/mixins/actions/restore'
import { createLocationTrash, createLocationSpaces } from 'web-app-files/src/router'
import { mock, mockDeep } from 'jest-mock-extended'
import { OwnCloudSdk } from 'web-client/src/types'
import { createStore, defaultStoreMockOptions, getComposableWrapper } from 'web-test-helpers'
import { useStore } from 'web-pkg/src/composables'
import { unref } from 'vue'
import { Resource } from 'web-client/src'
import { ProjectSpaceResource } from 'web-client/src/helpers'

describe('restore', () => {
  afterEach(() => jest.clearAllMocks())

  describe('isEnabled property', () => {
    it('should be false when no resource is given', () => {
      const { wrapper } = getWrapper({
        setup: ({ actions }, space) => {
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
        setup: ({ actions }, space) => {
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
        setup: ({ actions }, space) => {
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
        setup: ({ actions }, space) => {
          expect(unref(actions)[0].isEnabled({ space, resources: [{}] as Resource[] })).toBe(false)
        }
      })
    })
    it('should be false in a space trash bin with insufficient permissions', () => {
      const { wrapper, mocks } = getWrapper({
        driveType: 'project',
        setup: ({ actions }, space) => {
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

  // FIXME: methods are not accessible anymore ...
  describe('method "$_restore_trigger"', () => {
    it.skip('should show message on success', async () => {
      const { wrapper } = getWrapper({
        setup: async ({ actions }) => {
          const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
          const removeFilesFromTrashbinStub = jest.spyOn(wrapper.vm, 'removeFilesFromTrashbin')
          await wrapper.vm.$_restore_restoreResources([{ id: '1', path: '/1' }], [])

          expect(showMessageStub).toHaveBeenCalledTimes(1)
          expect(removeFilesFromTrashbinStub).toHaveBeenCalledTimes(1)
        }
      })
    })

    it.skip('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)

      const { wrapper } = getWrapper({
        resolveClearTrashBin: false,
        setup: async ({ actions }) => {
          const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
          const removeFilesFromTrashbinStub = jest.spyOn(wrapper.vm, 'removeFilesFromTrashbin')
          await wrapper.vm.$_restore_restoreResources([{ id: '1', path: '/1' }], [])

          expect(showMessageStub).toHaveBeenCalledTimes(1)
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
  setup: (instance: ReturnType<typeof useRestore>, space: ProjectSpaceResource) => void
}) {
  const clientMock = mockDeep<OwnCloudSdk>()
  const mocks = {
    $router: {
      currentRoute: invalidLocation
        ? createLocationSpaces('files-spaces-generic')
        : createLocationTrash('files-trash-generic'),
      resolve: (r) => {
        return { href: r.name }
      }
    },
    $gettext: jest.fn(),
    $gettextInterpolate: jest.fn(),
    space: mock<ProjectSpaceResource>({
      driveType,
      isEditor: () => false,
      isManager: () => false
    }),
    createModal: jest.fn(),
    $clientService: {
      webdav: {
        listFiles: jest.fn().mockImplementation(() => {
          return { resource: {}, children: [] }
        }),
        restoreFile: jest.fn().mockImplementation(() => {
          if (resolveRestore) {
            return Promise.resolve({})
          }
          return Promise.reject(new Error(''))
        })
      }
    },
    $client: {
      ...clientMock,
      users: { getUser: () => ({ quota: {} }) },
      fileTrash: {
        restore: jest.fn().mockImplementation(() => {
          if (resolveRestore) {
            return Promise.resolve({})
          }
          return Promise.reject(new Error(''))
        })
      }
    }
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
    mocks,
    wrapper: getComposableWrapper(
      () => {
        const store = useStore()
        const instance = useRestore({ store })
        setup(instance, mocks.space)
      },
      {
        mocks,
        store
      }
    )
  }
}
