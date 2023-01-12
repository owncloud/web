import ReadmeContentModal from 'web-pkg/src/components/Spaces/ReadmeContentModal.vue'
import { mockDeep } from 'jest-mock-extended'
import { OwnCloudSdk } from 'web-client/src/types'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks,
  defaultStubs
} from 'web-test-helpers'

afterEach(() => jest.clearAllMocks())

describe('ReadmeContentModal', () => {
  describe('method "editReadme"', () => {
    it('should show message on success', async () => {
      const { wrapper } = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.editReadme()

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper } = getWrapper(false)
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.editReadme()

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper(resolvePutFileContents = true) {
  const clientMock = mockDeep<OwnCloudSdk>()
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  return {
    wrapper: mount(ReadmeContentModal, {
      props: {
        cancel: jest.fn(),
        space: {
          id: '1fe58d8b-aa69-4c22-baf7-97dd57479f22',
          spaceReadmeData: {
            webDavUrl:
              'https://localhost:9200/dav/spaces/1fe58d8b-aa69-4c22-baf7-97dd57479f22/.space/readme.md'
          }
        }
      },
      global: {
        plugins: [...defaultPlugins(), store],
        stubs: { ...defaultStubs, portal: true, 'oc-modal': true },
        mocks: {
          ...defaultComponentMocks(),
          $client: {
            ...clientMock,
            files: {
              ...clientMock.files,
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
          }
        }
      }
    })
  }
}
