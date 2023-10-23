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

jest.mock('../../../../src/composables/spaces/useGetMatchingSpace', () => ({
  useGetMatchingSpace: jest.fn()
}))

describe('Preview component', () => {
  const driveAliasAndItem = '1'
  jest.mocked(useGetMatchingSpace).mockImplementation(() => useGetMatchingSpaceMock())
  it('should set correct props on oc-resource component', () => {
    const { wrapper } = getWrapper({
      space: mock<SpaceResource>({
        id: '1',
        driveType: 'project',
        name: 'New space',
        getDriveAliasAndItem: () => driveAliasAndItem
      })
    })
    const ocResource = wrapper.findComponent<any>('oc-resource-stub')

    expect(ocResource.props().resource).toMatchObject(wrapper.vm.searchResult.data)
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
  user = { id: 'test' }
}: {
  route?: any
  hasShareJail?: boolean
  space?: SpaceResource
  searchResult?: any
  user?: any
} = {}) {
  jest.mocked(useGetMatchingSpace).mockImplementation(() =>
    useGetMatchingSpaceMock({
      getMatchingSpace() {
        return space
      }
    })
  )

  const storeOptions = {
    ...defaultStoreMockOptions,
    getters: {
      ...defaultStoreMockOptions.getters,
      configuration: () => ({
        options: {
          disablePreviews: true
        }
      }),
      capabilities: () => ({
        spaces: {
          share_jail: hasShareJail
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
