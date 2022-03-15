import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import setImage from '@files/src/mixins/spaces/actions/setImage.js'
import { createLocationSpaces } from '../../../../src/router'
import mockAxios from 'jest-mock-axios'
// eslint-disable-next-line jest/no-mocks-import
import sdkMock from '@/__mocks__/sdk'
import fileFixtures from '__fixtures__/files'
import { bus } from 'web-pkg/src/instance'
import { thumbnailService } from '../../../../src/services'
import { buildSpace } from '../../../../src/helpers/resources'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('setImage', () => {
  const Component = {
    render() {},
    mixins: [setImage]
  }

  function getWrapper(space) {
    return mount(Component, {
      localVue,
      mocks: {
        $client: {
          ...sdkMock,
          files: {
            ...sdkMock.files,
            copy: jest.fn().mockImplementation(() => Promise.resolve()),
            fileInfo: jest.fn().mockImplementation(() => Promise.resolve(fileFixtures['/'][4]))
          }
        },
        $route: {
          params: {
            storageId: '1fe58d8b-aa69-4c22-baf7-97dd57479f22'
          }
        },
        $router: {
          currentRoute: createLocationSpaces('files-spaces-projects'),
          resolve: (r) => {
            return { href: r.name }
          }
        },
        $gettext: jest.fn()
      },
      provide: {
        currentSpace: {
          value: space
        }
      },
      store: createStore(Vuex.Store, {
        actions: {
          createModal: jest.fn(),
          hideModal: jest.fn(),
          showMessage: jest.fn(),
          setModalInputErrorMessage: jest.fn()
        },
        getters: {
          configuration: () => ({
            server: 'https://example.com'
          }),
          getToken: () => 'token'
        },
        modules: {
          user: {
            state: {
              id: 'alice',
              uuid: 1
            }
          },
          Files: {
            namespaced: true,
            mutations: {
              UPDATE_RESOURCE_FIELD: jest.fn()
            }
          }
        }
      })
    })
  }

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
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.resolve({ data: { special: [{ specialFolder: { name: 'image' } }] } })
      })

      const wrapper = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      bus.publish = jest.fn((path) => path)
      await wrapper.vm.$_setSpaceImage_trigger({
        resources: [
          {
            webDavPath: '/spaces/1fe58d8b-aa69-4c22-baf7-97dd57479f22/subfolder/image.png',
            name: 'image.png'
          }
        ]
      })

      expect(showMessageStub).toHaveBeenCalledTimes(1)
      expect(bus.publish).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.reject(new Error())
      })

      const wrapper = getWrapper()
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

    it('should not set the image if source and destination path are the same', async () => {
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
    })
  })
})
