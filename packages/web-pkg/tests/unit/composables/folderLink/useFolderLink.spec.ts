import { mock } from 'jest-mock-extended'
import {
  RouteLocation,
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  getComposableWrapper
} from 'web-test-helpers'
import { useFolderLink } from '../../../../src/composables'
import { ConfigurationManager, configurationManager } from '../../../../src/configuration'

jest.mock('../../../../src/configuration', () => {
  return {
    configurationManager: {
      options: {
        routing: {
          fullShareOwnerPaths: false,
          idBased: true
        }
      }
    }
  }
})

jest.mock('../../../../src/composables/configuration', () => ({
  useConfigurationManager: () =>
    mock<ConfigurationManager>({
      options: {
        routing: {
          fullShareOwnerPaths: false,
          idBased: true
        }
      }
    })
}))

/*jest.mock('../../../../src/composables', () => ({
  ...jest.requireActual('../../../../src/composables'),
  useConfigurationManager: () =>
    mockDeep<ConfigurationManager>({
      options: {
        routing: {
          fullShareOwnerPaths: true
        }
      }
    })
}))*/

describe('useFolderLink', () => {
  it('getFolderLink should return the correct folder link', () => {
    const resource = {
      path: '/my-folder',
      id: '2',
      fileId: '2',
      storageId: '1'
    }
    const wrapper = createWrapper()

    const folderLink = wrapper.vm.getFolderLink(resource)
    expect(folderLink).toEqual({
      name: 'files-spaces-generic',
      params: { driveAliasAndItem: 'personal/admin' },
      query: {fileId: '2'}
    })
  })

  it('getParentFolderLink should return the correct parent folder link', () => {
    const resource = {
      path: '/my-folder',
      id: '2',
      fileId: '2',
      storageId: '2',
      parentFolderId: '1'
    }

    const wrapper = createWrapper()
    const parentFolderLink = wrapper.vm.getParentFolderLink(resource)
    expect(parentFolderLink).toEqual({
      name: 'files-spaces-generic',
      params: { driveAliasAndItem: 'personal/admin' },
      query: { fileId: '1' }
    })
  })
  /*
        it('getParentFolderName should return the correct parent folder name', () => {
          const resource = {
            path: '/my-folder',
            shareId: 456
            // ... other properties as needed
          }

          const { result } = renderHook(() => useFolderLink())

          const parentFolderName = result.current.getParentFolderName(resource)
          expect(parentFolderName).toBe('Shared with me')
        })

        it('getParentFolderLinkIconAdditionalAttributes should return the correct icon attributes', () => {
          // Similar setup as the previous tests
          const resource = {
            path: '/my-folder'
            // ... other properties as needed
          }

          const { result } = renderHook(() => useFolderLink())

          const iconAttributes = result.current.getParentFolderLinkIconAdditionalAttributes(resource)
          expect(iconAttributes).toEqual({
            name: 'layout-grid',
            'fill-type': 'fill'
          })
        })*/
})

const createWrapper = () => {
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.modules.runtime.modules.spaces.getters.spaces = jest.fn(() => [
    {
      id: '1',
      fileId: '1',
      driveType: 'personal',
      getDriveAliasAndItem: () => 'personal/admin'
    }
  ])
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks({
    /*currentRoute: mock<RouteLocation>({
                  name: 'files-spaces-generic',
                  path: '/',
                  query: { fileId: undefined }
                })*/
  })
  return getComposableWrapper(
    () => {
      const {
        getParentFolderLink,
        getFolderLink,
        getParentFolderName,
        getParentFolderLinkIconAdditionalAttributes
      } = useFolderLink()

      return {
        getParentFolderLink,
        getFolderLink,
        getParentFolderName,
        getParentFolderLinkIconAdditionalAttributes
      }
    },
    {
      mocks,
      provide: mocks,
      store
    }
  )
}
