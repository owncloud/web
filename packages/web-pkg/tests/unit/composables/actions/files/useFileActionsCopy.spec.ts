import { mock } from 'jest-mock-extended'
import { unref } from 'vue'
import { Resource } from 'web-client'

import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  RouteLocation,
  getComposableWrapper
} from 'web-test-helpers'
import { useFileActionsCopy } from 'web-pkg/src/composables'

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
          const { wrapper } = getWrapper({
            searchLocation: true,
            setup: ({ actions }, { storeOptions }) => {
              unref(actions)[0].handler({ space: null, resources })
              expect(storeOptions.modules.Files.actions.copySelectedFiles).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                  resources: resources.filter((r) => copyAbleResources.includes(r.id as string))
                })
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
  setup: (
    instance: ReturnType<typeof useFileActionsCopy>,
    {
      storeOptions
    }: {
      storeOptions: typeof defaultStoreMockOptions
    }
  ) => void
}) {
  const routeName = searchLocation ? 'files-common-search' : 'files-spaces-generic'

  const storeOptions = {
    ...defaultStoreMockOptions,
    modules: { ...defaultStoreMockOptions.modules, user: { state: { id: 'alice', uuid: 1 } } }
  }
  const store = createStore(storeOptions)
  const mocks = {
    ...defaultComponentMocks({ currentRoute: mock<RouteLocation>({ name: routeName }) }),
    space: { driveType: 'personal', spaceRoles: { viewer: [], editor: [], manager: [] } }
  }
  return {
    mocks,
    wrapper: getComposableWrapper(
      () => {
        const instance = useFileActionsCopy({ store })
        setup(instance, { storeOptions })
      },
      {
        mocks,
        provide: mocks,
        store
      }
    )
  }
}
