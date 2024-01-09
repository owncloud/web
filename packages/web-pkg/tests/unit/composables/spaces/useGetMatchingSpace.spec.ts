import { useGetMatchingSpace } from '../../../../src/composables/spaces'
import { defaultComponentMocks, getComposableWrapper, RouteLocation } from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { Resource, SpaceResource } from '@ownclouders/web-client'

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
  setup: (instance: ReturnType<typeof useGetMatchingSpace>) => void
}) {
  const mocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({
        name: 'files-spaces-generic',
        params: { driveAliasAndItem }
      })
    })
  }

  const spaces = [
    mock<SpaceResource>({ id: '1', driveType: 'project' }),
    mock<SpaceResource>({ id: 'xyz', driveType: 'public' })
  ]

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useGetMatchingSpace()
        setup(instance)
      },
      {
        mocks,
        provide: mocks,
        pluginOptions: { piniaOptions: { spacesState: { spaces } } }
      }
    )
  }
}
