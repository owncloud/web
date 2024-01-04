import { mock } from 'jest-mock-extended'
import { ResourcePreview } from '../../../../src/components'
import { SpaceResource } from '@ownclouders/web-client/src'
import { useGetMatchingSpace } from '../../../../src/composables/spaces/useGetMatchingSpace'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions,
  useGetMatchingSpaceMock
} from 'web-test-helpers'
import { useFileActions } from '../../../../src/composables/actions'

jest.mock('../../../../src/composables/spaces/useGetMatchingSpace', () => ({
  useGetMatchingSpace: jest.fn()
}))

jest.mock('../../../../src/composables/actions', () => ({
  useFileActions: jest.fn()
}))

const selectors = {
  resourceListItemStub: 'resource-list-item-stub'
}

describe('Preview component', () => {
  const driveAliasAndItem = '1'
  jest.mocked(useGetMatchingSpace).mockImplementation(() => useGetMatchingSpaceMock())
  it('should render preview component', () => {
    const { wrapper } = getWrapper({
      space: mock<SpaceResource>({
        id: '1',
        driveType: 'project',
        name: 'New space',
        getDriveAliasAndItem: () => driveAliasAndItem
      })
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('should render resource component without file extension when areFileExtensionsShown is set to false', () => {
    const { wrapper } = getWrapper({
      areFileExtensionsShown: false,
      space: mock<SpaceResource>({
        id: '1',
        driveType: 'project',
        name: 'New space',
        getDriveAliasAndItem: () => driveAliasAndItem
      })
    })
    expect(
      wrapper.findComponent<any>(selectors.resourceListItemStub).attributes().isextensiondisplayed
    ).toBe('false')
  })
})

function getWrapper({
  route = {
    query: {},
    params: {}
  },
  hasShareJail = true,
  space = null,
  searchResult = {
    id: '1',
    data: {
      storageId: '1',
      name: 'lorem.txt',
      path: '/',
      shareRoot: ''
    }
  },
  user = { id: 'test' },
  areFileExtensionsShown = true
}: {
  route?: any
  hasShareJail?: boolean
  space?: SpaceResource
  searchResult?: any
  user?: any
  areFileExtensionsShown?: boolean
} = {}) {
  jest.mocked(useGetMatchingSpace).mockImplementation(() =>
    useGetMatchingSpaceMock({
      isResourceAccessible() {
        return true
      },
      getMatchingSpace() {
        return space
      }
    })
  )
  jest.mocked(useFileActions).mockReturnValue(mock<ReturnType<typeof useFileActions>>())

  const storeOptions = {
    ...defaultStoreMockOptions,
    modules: {
      Files: {
        state: {
          areFileExtensionsShown
        }
      }
    },
    getters: {
      ...defaultStoreMockOptions.getters,
      configuration: () => ({
        options: {
          disablePreviews: true
        }
      }),
      capabilities: () => ({
        spaces: {
          share_jail: hasShareJail,
          projects: { enabled: true }
        }
      }),
      user: () => user
    }
  }
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks({ currentRoute: route })
  return {
    wrapper: shallowMount(ResourcePreview, {
      props: {
        searchResult
      },
      global: {
        provide: mocks,
        renderStubDefaultSlot: true,
        mocks,
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
