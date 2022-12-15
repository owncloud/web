import setImage from 'web-app-files/src/mixins/spaces/actions/setImage'
import { thumbnailService } from '../../../../src/services'
import { buildSpace, Resource } from 'web-client/src/helpers'
import { mockDeep } from 'jest-mock-extended'
import { ClientService, clientService } from 'web-pkg'
import { Graph } from 'web-client'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks
} from 'web-test-helpers'

const Component = {
  template: '<div></div>',
  mixins: [setImage]
}

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
      const spaceMock = {
        id: '1',
        quota: {},
        root: {
          permissions: [{ roles: ['manager'], grantedTo: [{ user: { id: 1 } }] }]
        },
        special: [{ specialFolder: { name: 'image' }, file: { mimeType: 'image/png' } }]
      }
      const wrapper = getWrapper(buildSpace(spaceMock))
      expect(wrapper.vm.$_setSpaceImage_items[0].isEnabled({ resources: [] })).toBe(false)
    })
    it('should be false when mimeType is not image', () => {
      const spaceMock = {
        id: '1',
        quota: {},
        root: {
          permissions: [{ roles: ['manager'], grantedTo: [{ user: { id: 1 } }] }]
        },
        special: [{ specialFolder: { name: 'image' }, file: { mimeType: 'image/png' } }]
      }
      const wrapper = getWrapper(buildSpace(spaceMock))
      expect(
        wrapper.vm.$_setSpaceImage_items[0].isEnabled({
          resources: [{ id: 1, mimeType: 'text/plain' }]
        })
      ).toBe(false)
    })
    it('should be true when the mimeType is image', () => {
      const spaceMock = {
        id: '1',
        quota: {},
        root: {
          permissions: [{ roles: ['manager'], grantedTo: [{ user: { id: 1 } }] }]
        },
        special: [{ specialFolder: { name: 'image' }, file: { mimeType: 'image/png' } }]
      }
      const wrapper = getWrapper(buildSpace(spaceMock))
      expect(
        wrapper.vm.$_setSpaceImage_items[0].isEnabled({
          resources: [{ id: 1, mimeType: 'image/png' }]
        })
      ).toBe(true)
    })
    it('should be false when the current user is a viewer', () => {
      const spaceMock = {
        id: '1',
        quota: {},
        root: {
          permissions: [{ roles: ['viewer'], grantedTo: [{ user: { id: 1 } }] }]
        },
        special: [{ specialFolder: { name: 'image' }, file: { mimeType: 'image/png' } }]
      }
      const wrapper = getWrapper(buildSpace(spaceMock))
      expect(
        wrapper.vm.$_setSpaceImage_items[0].isEnabled({
          resources: [{ id: 1, mimeType: 'image/png' }]
        })
      ).toBe(false)
    })
  })

  describe('method "$_setSpaceImage_trigger"', () => {
    it('should show message on success', async () => {
      const responseMock = { data: { special: [{ specialFolder: { name: 'image' } }] } }
      const graphMock = mockDeep<Graph>({
        drives: { updateDrive: jest.fn().mockResolvedValue(responseMock) }
      })
      jest.spyOn(clientService, 'graphAuthenticated').mockImplementation(() => graphMock)

      const wrapper = getWrapper({ id: 1 })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_setSpaceImage_trigger({
        resources: [
          {
            webDavPath: '/spaces/1fe58d8b-aa69-4c22-baf7-97dd57479f22/subfolder/image.png',
            name: 'image.png'
          }
        ]
      })

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const graphMock = mockDeep<Graph>({
        drives: { updateDrive: jest.fn().mockRejectedValue(new Error()) }
      })
      jest.spyOn(clientService, 'graphAuthenticated').mockImplementation(() => graphMock)

      const wrapper = getWrapper({ id: 1 })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_setSpaceImage_trigger({
        resources: [
          {
            webDavPath: '/spaces/1fe58d8b-aa69-4c22-baf7-97dd57479f22/subfolder/image.png',
            name: 'image.png'
          }
        ]
      })

      expect(showMessageStub).toHaveBeenCalledTimes(1)
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

function getWrapper(space) {
  const clientMock = mockDeep<ClientService>()
  clientMock.webdav.getFileInfo.mockResolvedValue(mockDeep<Resource>())
  const defaultMocks = defaultComponentMocks({ currentRoute: { name: 'files-spaces-generic' } })
  const storeOptions = {
    ...defaultStoreMockOptions,
    modules: { ...defaultStoreMockOptions.modules, user: { state: { id: 'alice', uuid: 1 } } }
  }
  const store = createStore(storeOptions)
  return mount(Component, {
    global: {
      plugins: [...defaultPlugins(), store],
      mocks: {
        ...defaultMocks,
        $clientService: clientMock,
        space
      }
    }
  })
}
