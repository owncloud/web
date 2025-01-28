import { defaultComponentMocks, getComposableWrapper } from '@ownclouders/web-test-helpers'
import { useCreateFileHandler } from '../../../src/composables/useCreateFileHandler'
import { mock } from 'vitest-mock-extended'
import { LinkShare, Resource, SpaceResource } from '@ownclouders/web-client'
import { useSharesStore } from '@ownclouders/web-pkg'
import { SharingLinkType } from '@ownclouders/web-client/graph/generated'
import { MockedFunction } from 'vitest'

const space = mock<SpaceResource>()
const currentFolder = mock<Resource>({ path: '/current/folder' })
const createdFolder = mock<Resource>()

describe('createFileHandler', () => {
  it('should create all necessary resources and links', () => {
    getWrapper({
      async setup(instance, mocks) {
        const { addLink } = useSharesStore()

        ;(addLink as MockedFunction<typeof addLink>).mockResolvedValue(
          mock<LinkShare>({
            webUrl: 'https://example.org/public-link'
          })
        )

        await instance.createFileHandler({
          fileName: 'protected',
          space,
          currentFolder,
          password: 'Pass$123',
          type: SharingLinkType.Edit
        })

        expect(mocks.$clientService.webdav.createFolder).toHaveBeenCalledWith(space, {
          path: '/.protected'
        })
        expect(addLink).toHaveBeenCalledWith({
          clientService: mocks.$clientService,
          space,
          resource: createdFolder,
          options: { password: 'Pass$123', type: SharingLinkType.Edit }
        })
        expect(mocks.$clientService.webdav.putFileContents).toHaveBeenCalledWith(space, {
          path: '/current/folder/protected.psec',
          content: btoa('https://example.org/public-link')
        })
      }
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (
    instance: ReturnType<typeof useCreateFileHandler>,
    mocks: ReturnType<typeof defaultComponentMocks>
  ) => void
}) {
  const mocks = defaultComponentMocks()

  mocks.$clientService.webdav.createFolder.mockResolvedValue(createdFolder)

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useCreateFileHandler()
        setup(instance, mocks)
      },
      {
        mocks,
        provide: mocks
      }
    )
  }
}
