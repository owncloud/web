import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import setReadme from '@files/src/mixins/spaces/actions/setReadme.js'
import { createLocationSpaces } from '../../../../src/router'
// eslint-disable-next-line jest/no-mocks-import
import sdkMock from '@/__mocks__/sdk'
import { bus } from 'web-pkg/src/instance'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('setReadme', () => {
  const Component = {
    render() {},
    mixins: [setReadme]
  }

  function getWrapper(resolveGetFileContents = true) {
    return mount(Component, {
      localVue,
      mocks: {
        $client: {
          ...sdkMock,
          files: {
            ...sdkMock.files,
            getFileContents: jest.fn().mockImplementation(() => {
              if (resolveGetFileContents) {
                return Promise.resolve('readme')
              }
              return Promise.reject(new Error(''))
            }),
            putFileContents: jest
              .fn()
              .mockImplementation(() => Promise.resolve({ ETag: '60c7243c2e7f1' }))
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
            },
            state: {
              currentFolder: {
                id: '1fe58d8b-aa69-4c22-baf7-97dd57479f22'
              }
            }
          }
        }
      })
    })
  }

  describe('method "$_setSpaceReadme_setReadmeSpace"', () => {
    it('should show message on success', async () => {
      const wrapper = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      bus.publish = jest.fn((path) => path)
      await wrapper.vm.$_setSpaceReadme_setReadmeSpace({
        resources: [
          {
            webDavPath: '/spaces/1fe58d8b-aa69-4c22-baf7-97dd57479f22/subfolder',
            name: 'readme.md'
          }
        ]
      })

      expect(showMessageStub).toHaveBeenCalledTimes(1)
      expect(bus.publish).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      const wrapper = getWrapper(false)
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_setSpaceReadme_setReadmeSpace({
        resources: [
          {
            webDavPath: '/spaces/1fe58d8b-aa69-4c22-baf7-97dd57479f22/subfolder',
            name: 'readme.md'
          }
        ]
      })

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
  })
})
