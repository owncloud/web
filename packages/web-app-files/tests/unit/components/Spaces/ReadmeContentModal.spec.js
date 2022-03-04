import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import ReadmeContentModal from '@files/src/components/Spaces/ReadmeContentModal.vue'
import stubs from 'tests/unit/stubs'
// eslint-disable-next-line jest/no-mocks-import
import sdkMock from '@/__mocks__/sdk'
import { createStore } from 'vuex-extensions'

const localVue = createLocalVue()
localVue.use(Vuex)

afterEach(() => jest.clearAllMocks())

describe('ReadmeContentModal', () => {
  describe('method "editReadme"', () => {
    it('should show message on success', async () => {
      const wrapper = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.editReadme()

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = getWrapper(false)
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.editReadme()

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper(resolvePutFileContents = true) {
  return mount(ReadmeContentModal, {
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
          }),
          getFileContents: jest.fn().mockImplementation(() => {
            return Promise.resolve('readme')
          })
        }
      },
      $gettext: jest.fn(),
      $gettextInterpolate: jest.fn()
    },
    store: createStore(Vuex.Store, {
      actions: {
        showMessage: jest.fn()
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
    }),
    propsData: {
      cancel: jest.fn(),
      space: {
        id: '1fe58d8b-aa69-4c22-baf7-97dd57479f22',
        spaceReadmeData: {
          webDavUrl:
            'https://localhost:9200/dav/spaces/1fe58d8b-aa69-4c22-baf7-97dd57479f22/.space/readme.md'
        }
      }
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
    },
    stubs: { ...stubs, portal: true, 'oc-modal': true }
  })
}
