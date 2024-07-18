import { useFileActionsSetReadme } from '../../../../../src'
import { useMessages } from '../../../../../src/composables/piniaStores'
import { buildSpace, FileResource, SpaceResource } from '@ownclouders/web-client'
import { mock } from 'vitest-mock-extended'
import { defaultComponentMocks, RouteLocation, getComposableWrapper } from 'web-test-helpers'
import { unref } from 'vue'
import { GetFileContentsResponse } from '@ownclouders/web-client/webdav'
import { Drive } from '@ownclouders/web-client/graph/generated'

describe('setReadme', () => {
  describe('isVisible property', () => {
    it('should be false when no resource given', () => {
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isVisible({ space: null, resources: [] })).toBe(false)
        }
      })
    })
    it('should be false when mimeType is not text', () => {
      const space = buildSpace(
        mock<Drive>({
          id: '1',
          root: {
            permissions: [{ roles: ['manager'], grantedToIdentities: [{ user: { id: '1' } }] }]
          },
          special: [{ specialFolder: { name: 'readme' } }]
        })
      )
      getWrapper({
        resolveGetFileContents: true,
        space,
        setup: ({ actions }) => {
          expect(
            unref(actions)[0].isVisible({
              space,
              resources: [{ id: '1', mimeType: 'image/png' }] as SpaceResource[]
            })
          ).toBe(false)
        }
      })
    })
    it('should be true when the mimeType is "text/plain"', () => {
      const space = buildSpace(
        mock<Drive>({
          id: '1',
          root: {
            permissions: [{ roles: ['viewer'], grantedToIdentities: [{ user: { id: '1' } }] }]
          },
          special: [{ specialFolder: { name: 'readme' } }]
        })
      )
      getWrapper({
        resolveGetFileContents: true,
        space,
        setup: ({ actions }) => {
          expect(
            unref(actions)[0].isVisible({
              space,
              resources: [{ id: '1', mimeType: 'text/plain' }] as SpaceResource[]
            })
          ).toBe(false)
        }
      })
    })
    it('should be true when the mimeType is text', () => {
      const space = buildSpace(
        mock<Drive>({
          id: '1',
          root: {
            permissions: [{ roles: ['viewer'], grantedToIdentities: [{ user: { id: '1' } }] }]
          },
          special: [{ specialFolder: { name: 'readme' } }]
        })
      )
      getWrapper({
        resolveGetFileContents: true,
        space,
        setup: ({ actions }) => {
          expect(
            unref(actions)[0].isVisible({
              space,
              resources: [{ id: '1', mimeType: 'text' }] as SpaceResource[]
            })
          ).toBe(false)
        }
      })
    })
  })
  describe('handler', () => {
    it('should show message on success', () => {
      const space = mock<SpaceResource>({ id: '1' })
      getWrapper({
        resolveGetFileContents: true,
        space,
        setup: async ({ actions }) => {
          await unref(actions)[0].handler({
            space,
            resources: [
              {
                webDavPath: '/spaces/1fe58d8b-aa69-4c22-baf7-97dd57479f22/subfolder',
                name: 'readme.md'
              }
            ] as SpaceResource[]
          })

          const { showMessage } = useMessages()
          expect(showMessage).toHaveBeenCalledWith(
            expect.not.objectContaining({ status: 'danger' })
          )
        }
      })
    })

    it('should show message on error', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined)

      const space = mock<SpaceResource>({ id: '1' })
      getWrapper({
        resolveGetFileContents: false,
        space,
        setup: async ({ actions }) => {
          await unref(actions)[0].handler({
            space,
            resources: [
              {
                webDavPath: '/spaces/1fe58d8b-aa69-4c22-baf7-97dd57479f22/subfolder',
                name: 'readme.md'
              }
            ] as SpaceResource[]
          })

          const { showErrorMessage } = useMessages()
          expect(showErrorMessage).toHaveBeenCalled()
        }
      })
    })
  })
})

function getWrapper({
  resolveGetFileContents = true,
  space = undefined,
  setup
}: {
  resolveGetFileContents?: boolean
  space?: SpaceResource
  setup: (instance: ReturnType<typeof useFileActionsSetReadme>) => void
}) {
  const mocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ name: 'files-spaces-generic' })
    }),
    space
  }
  if (resolveGetFileContents) {
    mocks.$clientService.webdav.getFileContents.mockResolvedValue(mock<GetFileContentsResponse>())
  } else {
    mocks.$clientService.webdav.getFileContents.mockRejectedValue(new Error(''))
  }

  mocks.$clientService.webdav.putFileContents.mockResolvedValue(
    mock<FileResource>({ etag: '60c7243c2e7f1' })
  )

  mocks.$clientService.webdav.getFileInfo.mockImplementation(() =>
    Promise.resolve({ id: '1', path: '/space.readme.md' })
  )

  mocks.$clientService.graphAuthenticated.drives.updateDrive.mockResolvedValue(
    mock<SpaceResource>({
      id: '1',
      name: 'space',
      spaceReadmeData: {
        eTag: '6721ccbd5754e8b46ddccebad12fa23f',
        file: {
          mimeType: 'text/markdown'
        },
        id: '1',
        name: 'readme.md',
        specialFolder: {
          name: 'readme'
        }
      }
    })
  )

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useFileActionsSetReadme()
        setup(instance)
      },
      {
        mocks,
        provide: mocks
      }
    )
  }
}
