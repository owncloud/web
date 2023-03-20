import { useFileActionsSetImage } from 'web-app-files/src/composables/actions/files/useFileActionsSetImage'
import { thumbnailService } from '../../../../../src/services'
import { buildSpace, Resource, SpaceResource } from 'web-client/src/helpers'
import { mock, mockDeep } from 'jest-mock-extended'
import { clientService } from 'web-pkg'
import { Graph } from 'web-client'
import {
  createStore,
  defaultStoreMockOptions,
  defaultComponentMocks,
  RouteLocation,
  getComposableWrapper
} from 'web-test-helpers'
import { unref } from 'vue'

describe('setImage', () => {
  beforeAll(() => {
    thumbnailService.initialize({
      enabled: true,
      version: '0.1',
      supportedMimeTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'text/plain']
    })
  })

  afterEach(() => jest.clearAllMocks())

  describe('isEnabled property', () => {
    it('should be false when no resource given', () => {
      const space = buildSpace({
        id: '1',
        quota: {},
        root: {
          permissions: [{ roles: ['manager'], grantedToIdentities: [{ user: { id: 1 } }] }]
        },
        special: [{ specialFolder: { name: 'image' }, file: { mimeType: 'image/png' } }]
      })
      const wrapper = getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ space, resources: [] as Resource[] })).toBe(false)
        }
      })
    })
    it('should be false when mimeType is not image', () => {
      const space = buildSpace({
        id: '1',
        quota: {},
        root: {
          permissions: [{ roles: ['manager'], grantedToIdentities: [{ user: { id: 1 } }] }]
        },
        special: [{ specialFolder: { name: 'image' }, file: { mimeType: 'image/png' } }]
      })
      const wrapper = getWrapper({
        setup: ({ actions }) => {
          expect(
            unref(actions)[0].isEnabled({
              space,
              resources: [{ id: 1, mimeType: 'text/plain' }] as Resource[]
            })
          ).toBe(false)
        }
      })
    })
    it('should be true when the mimeType is image', () => {
      const space = buildSpace({
        id: '1',
        quota: {},
        root: {
          permissions: [{ roles: ['manager'], grantedToIdentities: [{ user: { id: 1 } }] }]
        },
        special: [{ specialFolder: { name: 'image' }, file: { mimeType: 'image/png' } }]
      })
      const wrapper = getWrapper({
        setup: async ({ actions }) => {
          expect(
            unref(actions)[0].isEnabled({
              space,
              resources: [{ id: 1, mimeType: 'image/png' }] as Resource[]
            })
          ).toBe(true)
        }
      })
    })
    it('should be false when the current user is a viewer', () => {
      const space = buildSpace({
        id: '1',
        quota: {},
        root: {
          permissions: [{ roles: ['viewer'], grantedToIdentities: [{ user: { id: 1 } }] }]
        },
        special: [{ specialFolder: { name: 'image' }, file: { mimeType: 'image/png' } }]
      })
      const wrapper = getWrapper({
        setup: ({ actions }) => {
          expect(
            unref(actions)[0].isEnabled({
              space,
              resources: [{ id: 1, mimeType: 'image/png' }] as Resource[]
            })
          ).toBe(false)
        }
      })
    })
  })

  describe('method "$_setSpaceImage_trigger"', () => {
    it('should show message on success', async () => {
      const responseMock = { data: { special: [{ specialFolder: { name: 'image' } }] } }
      const graphMock = mockDeep<Graph>({
        drives: { updateDrive: jest.fn().mockResolvedValue(responseMock) }
      })

      const space = mock<SpaceResource>({ id: 1 })
      const wrapper = getWrapper({
        setup: async ({ actions }, { storeOptions, clientService }) => {
          clientService.graphAuthenticated.mockImplementation(() => graphMock)
          await unref(actions)[0].handler({
            space,
            resources: [
              {
                webDavPath: '/spaces/1fe58d8b-aa69-4c22-baf7-97dd57479f22/subfolder/image.png',
                name: 'image.png'
              }
            ] as Resource[]
          })
          expect(storeOptions.actions.showMessage).toHaveBeenCalledTimes(1)
        }
      })
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const graphMock = mockDeep<Graph>({
        drives: { updateDrive: jest.fn().mockRejectedValue(new Error()) }
      })

      const space = mock<SpaceResource>({ id: 1 })
      const wrapper = getWrapper({
        setup: async ({ actions }, { storeOptions, clientService }) => {
          await unref(actions)[0].handler({
            space,
            resources: [
              {
                webDavPath: '/spaces/1fe58d8b-aa69-4c22-baf7-97dd57479f22/subfolder/image.png',
                name: 'image.png'
              }
            ] as Resource[]
          })
          expect(storeOptions.actions.showMessage).toHaveBeenCalledTimes(1)
        }
      })
    })

    /* FIXME: Reintroduce with latest copyMove bugfix
      it('should not copy the image if source and destination path are the same', async () => {
        mockAxios.request.mockImplementationOnce(() => {
          return Promise.resolve({ data: { special: [{ specialFolder: { name: 'image' } }] } })
        })
        const wrapper = getWrapper()
        await wrapper.vm.$_setSpaceImage_trigger({
          resources: [
            {
              webDavPath: '/spaces/1fe58d8b-aa69-4c22-baf7-97dd57479f22/.space/image.png',
              name: 'image.png'
            }
          ]
        })
        expect(wrapper.vm.$client.files.copy).toBeCalledTimes(0)
      }) */
  })
})

function getWrapper({
  setup
}: {
  setup: (
    instance: ReturnType<typeof useFileActionsSetImage>,
    options: {
      storeOptions: typeof defaultStoreMockOptions
      clientService: ReturnType<typeof defaultComponentMocks>['$clientService']
    }
  ) => void
}) {
  const mocks = defaultComponentMocks({
    currentRoute: mock<RouteLocation>({ name: 'files-spaces-generic' })
  })
  mocks.$clientService.webdav.getFileInfo.mockResolvedValue(mockDeep<Resource>())

  const storeOptions = {
    ...defaultStoreMockOptions
  }
  storeOptions.getters.user.mockImplementation(() => ({ id: 'alice', uuid: 1 }))

  const store = createStore(storeOptions)
  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useFileActionsSetImage({ store })
        setup(instance, { storeOptions, clientService: mocks.$clientService })
      },
      {
        store,
        mocks
      }
    )
  }
}
