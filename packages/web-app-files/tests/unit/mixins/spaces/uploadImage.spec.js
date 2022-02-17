import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import uploadImage from '@files/src/mixins/spaces/actions/uploadImage.js'
import { createLocationSpaces } from '../../../../src/router'
import mockAxios from 'jest-mock-axios'
// eslint-disable-next-line jest/no-mocks-import
import sdkMock from '@/__mocks__/sdk'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('uploadImage', () => {
  const Component = {
    render() {},
    mixins: [uploadImage]
  }

  function getWrapper(resolvePutFileContents = true) {
    return mount(Component, {
      localVue,
      data: () => ({
        $_uploadImage_selectedSpace: {
          id: '1fe58d8b-aa69-4c22-baf7-97dd57479f22'
        }
      }),
      mocks: {
        $router: {
          currentRoute: createLocationSpaces('files-spaces-projects'),
          resolve: (r) => {
            return { href: r.name }
          }
        },
        $client: {
          ...sdkMock,
          files: {
            ...sdkMock.files,
            putFileContents: jest.fn().mockImplementation(() => {
              if (resolvePutFileContents) {
                return Promise.resolve({
                  'OC-FileId':
                    'YTE0ODkwNGItNTZhNy00NTQ4LTk2N2MtZjcwZjhhYTY0Y2FjOmQ4YzMzMmRiLWUxNWUtNDRjMy05NGM2LTViYjQ2MGMwMWJhMw=='
                })
              }
              return Promise.reject(new Error(''))
            })
          },
          $gettext: jest.fn()
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

  describe('method "$_uploadImage_uploadImageSpace"', () => {
    it('should show message on success', async () => {
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.resolve({ data: { special: [{ specialFolder: { name: 'image' } }] } })
      })

      const wrapper = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_uploadImage_uploadImageSpace({
        currentTarget: {
          files: [{ name: 'image.png', lastModifiedDate: new Date() }]
        }
      })

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      const wrapper = getWrapper(false)
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_uploadImage_uploadImageSpace({
        currentTarget: {
          files: [{ name: 'image.png', lastModifiedDate: new Date() }]
        }
      })

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
  })
})
