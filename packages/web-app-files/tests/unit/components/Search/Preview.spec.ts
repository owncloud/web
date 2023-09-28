import { mock } from 'jest-mock-extended'
import Preview from 'web-app-files/src/components/Search/Preview.vue'
import { Resource, SpaceResource } from 'web-client/src'
import { useGetMatchingSpace } from 'web-pkg/src'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'

const useGetMatchingSpaceMock = (
  options: Partial<ReturnType<typeof useGetMatchingSpace>> = {}
): ReturnType<typeof useGetMatchingSpace> => {
  return {
    getInternalSpace(storageId: string) {
      return mock<SpaceResource>()
    },
    getMatchingSpace(resource: Resource) {
      return mock<SpaceResource>()
    },
    ...options
  }
}

jest.mock('web-pkg/src/composables/spaces/useGetMatchingSpace')

describe('Preview component', () => {
  jest.mocked(useGetMatchingSpace).mockImplementation(() => useGetMatchingSpaceMock())
  it('should set correct props on oc-resource component', () => {
    const { wrapper } = getWrapper()
    const ocResource = wrapper.findComponent<any>('oc-resource-stub')

    expect(ocResource.exists()).toBeTruthy()
    expect(ocResource.props().resource).toMatchObject(wrapper.vm.searchResult.data)
  })
  describe('computed parentFolderLink', () => {
    it('should use the items storageId for the resource target location if present', () => {
      const driveAliasAndItem = '1'
      const { wrapper } = getWrapper({
        space: mock<SpaceResource>({
          id: '1',
          driveType: 'project',
          name: 'New space',
          getDriveAliasAndItem: () => driveAliasAndItem
        })
      })
      expect(wrapper.vm.parentFolderLink.params.driveAliasAndItem).toEqual(driveAliasAndItem)
    })
  })

  describe('computed method "parentFolderName"', () => {
    it('should equal "All files and folders" if spaces capability is not present', () => {
      const { wrapper } = getWrapper({
        hasShareJail: false
      })
      expect(wrapper.vm.parentFolderName).toEqual('All files and folders')
    })
    it('should equal the space name if resource storage is representing a project space', () => {
      const { wrapper } = getWrapper({
        space: mock<SpaceResource>({
          id: '1',
          driveType: 'project',
          name: 'New space',
          getDriveAliasAndItem: jest.fn()
        })
      })
      expect(wrapper.vm.parentFolderName).toEqual('New space')
    })
    it('should equal the share name if resource is representing a file or folder in the root of a share', () => {
      const { wrapper } = getWrapper({
        searchResult: {
          id: '1',
          data: {
            path: '/My share/test.txt',
            shareRoot: '/My share',
            shareId: '1'
          }
        }
      })
      expect(wrapper.vm.parentFolderName).toEqual('My share')
    })
    it('should equal the "Shared with me" if resource is representing the root share', () => {
      const { wrapper } = getWrapper({
        searchResult: {
          id: '1',
          data: {
            path: '/My share',
            shareRoot: '/My share',
            shareId: '1',
            isShareRoot: () => true
          }
        }
      })
      expect(wrapper.vm.parentFolderName).toEqual('Shared with me')
    })
    it('should equal "Personal" if resource storage is not representing the personal home', () => {
      const { wrapper } = getWrapper({
        space: mock<SpaceResource>({
          id: 1,
          driveType: 'personal'
        })
      })
      expect(wrapper.vm.parentFolderName).toEqual('Personal')
    })
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
    wrapper: shallowMount(Preview, {
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
