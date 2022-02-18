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

const localVue = createLocalVue()
localVue.use(Vuex)

describe('setImage', () => {
  const Component = {
    render() {},
    mixins: [setImage]
  }

  function getWrapper() {
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
            spaceId: '1fe58d8b-aa69-4c22-baf7-97dd57479f22'
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

  describe('isEnabled property', () => {
    it('should be false when no resource given', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.$_setSpaceImage_items[0].isEnabled({ resources: [] })).toBe(false)
    })
    it('should be false when mimeType is not image', () => {
      const wrapper = getWrapper()
      expect(
        wrapper.vm.$_setSpaceImage_items[0].isEnabled({
          resources: [{ id: 1, mimeType: 'text/plain' }]
        })
      ).toBe(false)
    })
    it('should be true when when mimeType is image', () => {
      const wrapper = getWrapper()
      expect(
        wrapper.vm.$_setSpaceImage_items[0].isEnabled({
          resources: [{ id: 1, mimeType: 'image/png' }]
        })
      ).toBe(true)
    })
  })

  describe('method "$_setSpaceImage_setImageSpace"', () => {
    it('should show message on success', async () => {
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.resolve({ data: { special: [{ specialFolder: { name: 'image' } }] } })
      })

      const wrapper = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      bus.publish = jest.fn((path) => path)
      await wrapper.vm.$_setSpaceImage_setImageSpace({
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
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.reject(new Error())
      })

      const wrapper = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_setSpaceImage_setImageSpace({
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
      await wrapper.vm.$_setSpaceImage_setImageSpace({
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
