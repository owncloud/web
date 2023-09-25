import ReadmeContentModal from 'web-pkg/src/components/Spaces/ReadmeContentModal.vue'
import { mock } from 'jest-mock-extended'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks,
  defaultStubs
} from 'web-test-helpers'
import { GetFileContentsResponse } from 'web-client/src/webdav/getFileContents'
import { Resource } from 'web-client/src'

describe('ReadmeContentModal', () => {
  describe('method "editReadme"', () => {
    it('should show message on success', async () => {
      const { wrapper, storeOptions } = getWrapper()
      await wrapper.vm.editReadme()
      expect(storeOptions.actions.showMessage).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper, storeOptions } = getWrapper(false)
      await wrapper.vm.editReadme()
      expect(storeOptions.actions.showErrorMessage).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper(resolvePutFileContents = true) {
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)

  const mocks = defaultComponentMocks()
  const { $clientService: clientService } = mocks
  clientService.webdav.getFileContents.mockResolvedValue(mock<GetFileContentsResponse>())
  if (resolvePutFileContents) {
    clientService.webdav.putFileContents.mockResolvedValue(mock<Resource>())
  } else {
    clientService.webdav.putFileContents.mockRejectedValue(new Error(''))
  }

  return {
    storeOptions,
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
        mocks,
        provide: mocks
      }
    })
  }
}
