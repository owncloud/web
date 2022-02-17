import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import editReadmeContent from '@files/src/mixins/spaces/actions/editReadmeContent.js'
import { createLocationSpaces } from '../../../../src/router'
// eslint-disable-next-line jest/no-mocks-import
import sdkMock from '@/__mocks__/sdk'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('editReadmeContent', () => {
  const Component = {
    render() {},
    mixins: [editReadmeContent]
  }

  function getWrapper(resolvePutFileContents = true) {
    return mount(Component, {
      localVue,
      mocks: {
        $client: {
          ...sdkMock,
          files: {
            ...sdkMock.files,
            putFileContents: jest.fn().mockImplementation(() => {
              if (resolvePutFileContents) {
                return Promise.resolve('readme')
              }
              return Promise.reject(new Error(''))
            })
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
                id: '1fe58d8b-aa69-4c22-baf7-97dd57479f22',
                spaceReadmeData: {
                  webDavUrl:
                    'https://localhost:9200/dav/spaces/1fe58d8b-aa69-4c22-baf7-97dd57479f22/.space/readme.md'
                }
              }
            }
          }
        }
      })
    })
  }

  describe('method "$_editReadmeContent_editReadmeContentSpace"', () => {
    it('should show message on success', async () => {
      const wrapper = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_editReadmeContent_editReadmeContentSpace()

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      const wrapper = getWrapper(false)
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_editReadmeContent_editReadmeContentSpace()

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
  })
})
