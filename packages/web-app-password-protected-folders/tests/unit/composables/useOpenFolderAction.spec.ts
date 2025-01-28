import { defaultComponentMocks, getComposableWrapper } from '@ownclouders/web-test-helpers'
import { useOpenFolderAction } from '../../../src/composables/useOpenFolderAction'
import { unref } from 'vue'
import { mock } from 'vitest-mock-extended'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { useModals } from '@ownclouders/web-pkg'
import { MockedFunction } from 'vitest'
import FolderViewModal from '../../../src/components/FolderViewModal.vue'

describe('openFolderAction', () => {
  it('should open a modal with the public link', () => {
    getWrapper({
      async setup(instance) {
        const { dispatchModal } = useModals()

        await unref(instance).handler({
          resources: [mock<Resource>()],
          space: mock<SpaceResource>()
        })

        const modalConfig = (dispatchModal as MockedFunction<typeof dispatchModal>).mock.calls
          .at(0)
          .at(0)
        const attrs = modalConfig.customComponentAttrs()

        expect(dispatchModal).toHaveBeenCalledWith(
          expect.objectContaining({ customComponent: FolderViewModal })
        )
        expect(attrs).toStrictEqual({ publicLink: 'https://example.org/public-link' })
      }
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (
    instance: ReturnType<typeof useOpenFolderAction>,
    mocks: ReturnType<typeof defaultComponentMocks>
  ) => void
}) {
  const mocks = defaultComponentMocks()
  mocks.$clientService.webdav.getFileContents.mockResolvedValue({
    body: btoa('https://example.org/public-link')
  })

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useOpenFolderAction()
        setup(instance, mocks)
      },
      {
        mocks,
        provide: mocks
      }
    )
  }
}
