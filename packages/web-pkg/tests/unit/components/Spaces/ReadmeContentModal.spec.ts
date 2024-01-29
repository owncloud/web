import ReadmeContentModal from '../../../../src/components/Spaces/ReadmeContentModal.vue'

import { defaultPlugins, mount, defaultComponentMocks, defaultStubs } from 'web-test-helpers'
import { GetFileContentsResponse } from '@ownclouders/web-client/src/webdav/getFileContents'
import { Resource } from '@ownclouders/web-client/src'
import { mock } from 'vitest-mock-extended'
import { useMessages } from '../../../../src/composables/piniaStores'

describe('ReadmeContentModal', () => {
  describe('method "onConfirm"', () => {
    it('should show message on success', async () => {
      const { wrapper } = getWrapper()
      await wrapper.vm.onConfirm()
      const { showMessage } = useMessages()
      expect(showMessage).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper } = getWrapper(false)
      await wrapper.vm.onConfirm()
      const { showErrorMessage } = useMessages()
      expect(showErrorMessage).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper(resolvePutFileContents = true) {
  const mocks = defaultComponentMocks()
  const { $clientService: clientService } = mocks
  clientService.webdav.getFileContents.mockResolvedValue(mock<GetFileContentsResponse>())
  if (resolvePutFileContents) {
    clientService.webdav.putFileContents.mockResolvedValue(mock<Resource>())
  } else {
    clientService.webdav.putFileContents.mockRejectedValue(new Error(''))
  }

  return {
    wrapper: mount(ReadmeContentModal, {
      props: {
        cancel: vi.fn(),
        space: {
          id: '1fe58d8b-aa69-4c22-baf7-97dd57479f22',
          spaceReadmeData: {
            webDavUrl:
              'https://localhost:9200/dav/spaces/1fe58d8b-aa69-4c22-baf7-97dd57479f22/.space/readme.md'
          }
        }
      },
      global: {
        plugins: [...defaultPlugins()],
        stubs: { ...defaultStubs, portal: true, 'oc-modal': true },
        mocks,
        provide: mocks
      }
    })
  }
}
