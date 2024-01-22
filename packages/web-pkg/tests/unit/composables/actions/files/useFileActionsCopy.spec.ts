import { mock } from 'jest-mock-extended'
import { unref } from 'vue'
import { Resource } from '@ownclouders/web-client'
import { defaultComponentMocks, RouteLocation, getComposableWrapper } from 'web-test-helpers'
import { useFileActionsCopy } from '../../../../../src/composables/actions/files'
import { useClipboardStore } from '../../../../../src/composables/piniaStores'

describe('copy', () => {
  describe('search context', () => {
    describe('computed property "actions"', () => {
      describe('handler', () => {
        it.each([
          {
            resources: [{ id: '1' }, { id: '2' }] as Resource[],
            copyAbleResources: ['1', '2']
          },
          {
            resources: [
              { id: '1' },
              { id: '2' },
              { id: '3' },
              { id: '4', fileId: '5', canDownload: () => true, driveType: 'project' }
            ] as Resource[],
            copyAbleResources: ['1', '2', '3']
          }
        ])('should filter non copyable resources', ({ resources, copyAbleResources }) => {
          getWrapper({
            searchLocation: true,
            setup: ({ actions }) => {
              unref(actions)[0].handler({ space: null, resources })
              const clipboardStore = useClipboardStore()
              expect(clipboardStore.copyResources).toHaveBeenCalledWith(
                resources.filter((r) => copyAbleResources.includes(r.id as string))
              )
            }
          })
        })
      })
    })
  })
})

function getWrapper({
  searchLocation = false,
  setup
}: {
  searchLocation: boolean
  setup: (instance: ReturnType<typeof useFileActionsCopy>) => void
}) {
  const routeName = searchLocation ? 'files-common-search' : 'files-spaces-generic'

  const mocks = {
    ...defaultComponentMocks({ currentRoute: mock<RouteLocation>({ name: routeName }) }),
    space: { driveType: 'personal', spaceRoles: { viewer: [], editor: [], manager: [] } }
  }
  return {
    mocks,
    wrapper: getComposableWrapper(
      () => {
        const instance = useFileActionsCopy()
        setup(instance)
      },
      {
        mocks,
        provide: mocks
      }
    )
  }
}
