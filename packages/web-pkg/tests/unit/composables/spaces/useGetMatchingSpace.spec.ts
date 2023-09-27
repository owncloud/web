import { useGetMatchingSpace } from '@ownclouders/web-pkg/src/composables'
import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  getComposableWrapper,
  RouteLocation
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { Resource, SpaceResource } from 'web-client'

describe('useSpaceHelpers', () => {
  it('should be valid', () => {
    expect(useGetMatchingSpace).toBeDefined()
  })
  describe('method "getMatchingSpace"', () => {
    it('should return the matching project space', () => {
      getWrapper({
        setup: ({ getMatchingSpace }) => {
          const resource = mock<Resource>({ storageId: '1' })
          expect(getMatchingSpace(resource).id).toEqual('1')
        }
      })
    })
    it('should return the matching public space', () => {
      getWrapper({
        driveAliasAndItem: 'public/xyz',
        setup: ({ getMatchingSpace }) => {
          const resource = mock<Resource>()
          expect(getMatchingSpace(resource).id).toEqual('xyz')
        }
      })
    })
    it('should return the matching share space', () => {
      getWrapper({
        setup: ({ getMatchingSpace }) => {
          const resource = mock<Resource>({ shareRoot: '/' })
          expect(getMatchingSpace(resource).driveType).toEqual('share')
        }
      })
    })
  })
})

function getWrapper({
  driveAliasAndItem = '',
  setup
}: {
  driveAliasAndItem?: string
  setup: (
    instance: ReturnType<typeof useGetMatchingSpace>,
    {
      storeOptions
    }: {
      storeOptions: typeof defaultStoreMockOptions
    }
  ) => void
}) {
  const mocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({
        name: 'files-spaces-generic',
        params: { driveAliasAndItem }
      })
    })
  }
  const storeOptions = defaultStoreMockOptions
  storeOptions.modules.runtime.modules.spaces.getters.spaces.mockImplementation(() => [
    mock<SpaceResource>({ id: '1', driveType: 'project' }),
    mock<SpaceResource>({ id: 'xyz', driveType: 'public' })
  ])
  const store = createStore(storeOptions)
  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useGetMatchingSpace()
        setup(instance, { storeOptions })
      },
      {
        store,
        mocks,
        provide: mocks
      }
    )
  }
}
