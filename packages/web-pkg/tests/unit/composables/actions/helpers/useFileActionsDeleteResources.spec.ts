import { useFileActionsDeleteResources } from '../../../../../src/composables/actions'
import { mockDeep } from 'vitest-mock-extended'
import { FolderResource, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { defaultComponentMocks, getComposableWrapper } from 'web-test-helpers'
import { nextTick } from 'vue'

const currentFolder = {
  id: '1',
  path: '/folder'
}

describe('deleteResources', () => {
  describe('method "filesList_delete"', () => {
    it('should call the delete action on a resource in the file list', () => {
      getWrapper({
        currentFolder,
        setup: async ({ filesList_delete }, { router }) => {
          await filesList_delete([{ id: '2', path: '/folder/fileToDelete.txt' }])
          await nextTick()
          expect(router.push).toHaveBeenCalledTimes(0)
        }
      })
    })

    it('should call the delete action on the current folder', () => {
      const resourcesToDelete = [currentFolder]
      getWrapper({
        currentFolder,
        setup: async ({ filesList_delete }, { router }) => {
          await filesList_delete(resourcesToDelete)
          // FIXME: well...
          await nextTick()
          await nextTick()
          await nextTick()
          await nextTick()
          await nextTick()
          await nextTick()
          await nextTick()
          await nextTick()
          await nextTick()
          expect(router.push).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})

function getWrapper({
  currentFolder,
  setup
}: {
  currentFolder: FolderResource
  setup: (
    instance: ReturnType<typeof useFileActionsDeleteResources>,
    {
      space,
      router
    }: {
      space: SpaceResource
      router: ReturnType<typeof defaultComponentMocks>['$router']
    }
  ) => void
}) {
  const mocks = {
    ...defaultComponentMocks(),
    space: mockDeep<SpaceResource>()
  }
  mocks.$clientService.webdav.deleteFile.mockResolvedValue(undefined)

  return {
    mocks,
    wrapper: getComposableWrapper(
      () => {
        const instance = useFileActionsDeleteResources()
        setup(instance, { space: mocks.space, router: mocks.$router })
      },
      {
        mocks,
        provide: mocks,
        pluginOptions: { piniaOptions: { resourcesStore: { currentFolder } } }
      }
    )
  }
}
