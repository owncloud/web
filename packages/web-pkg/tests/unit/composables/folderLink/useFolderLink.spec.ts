import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  getComposableWrapper
} from 'web-test-helpers'
import { CapabilityStore, useFolderLink } from '../../../../src/composables'
import { SpaceResource } from '@ownclouders/web-client'

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
      query: { fileId: '2' }
    })
  })

  it('getParentFolderLink should return the correct parent folder link', () => {
    const resource = {
      path: '/my-folder',
      id: '2',
      fileId: '2',
      storageId: '1',
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

  describe('getParentFolderName should return the correct parent folder name', () => {
    it('should equal "Personal" if share jail is enabled', () => {
      const resource = {
        path: '/my-folder',
        storageId: '1'
      }

      const wrapper = createWrapper()
      const parentFolderName = wrapper.vm.getParentFolderName(resource)
      expect(parentFolderName).toEqual('Personal')
    })
    it('should equal "All files and folders" if share jail disabled', () => {
      const resource = {
        path: '/my-folder',
        storageId: '1'
      }

      const wrapper = createWrapper({ hasShareJail: false })
      const parentFolderName = wrapper.vm.getParentFolderName(resource)
      expect(parentFolderName).toEqual('All files and folders')
    })
    it('should equal the space name if resource storage is representing a project space', () => {
      const resource = {
        path: '/my-folder',
        storageId: '2'
      }

      const wrapper = createWrapper()
      const parentFolderName = wrapper.vm.getParentFolderName(resource)
      expect(parentFolderName).toEqual('New space')
    })
    it('should equal the "Shared with me" if resource is representing the root share', () => {
      const resource = {
        path: '/My share',
        shareRoot: '/My share',
        shareId: '1',
        isShareRoot: () => true
      }

      const wrapper = createWrapper()
      const parentFolderName = wrapper.vm.getParentFolderName(resource)
      expect(parentFolderName).toEqual('Shared with me')
    })
    it('should equal the share name if resource is representing a file or folder in the root of a share', () => {
      const resource = {
        path: '/My share/test.txt',
        shareRoot: '/My share',
        shareId: '1'
      }

      const wrapper = createWrapper()
      const parentFolderName = wrapper.vm.getParentFolderName(resource)
      expect(parentFolderName).toEqual('My share')
    })
  })
})

const createWrapper = ({ hasShareJail = true }: { hasShareJail?: boolean } = {}) => {
  const storeOptions = { ...defaultStoreMockOptions }

  const spaces = [
    {
      id: '1',
      fileId: '1',
      driveType: 'personal',
      getDriveAliasAndItem: () => 'personal/admin'
    },
    {
      id: '2',
      driveType: 'project',
      name: 'New space',
      getDriveAliasAndItem: jest.fn()
    }
  ] as unknown as SpaceResource[]

  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks({})
  const capabilities = {
    spaces: { projects: true, share_jail: hasShareJail }
  } satisfies Partial<CapabilityStore['capabilities']>

  return getComposableWrapper(
    () => {
      const {
        getFolderLink,
        getParentFolderLink,
        getParentFolderName,
        getParentFolderLinkIconAdditionalAttributes
      } = useFolderLink()

      return {
        getFolderLink,
        getParentFolderLink,
        getParentFolderName,
        getParentFolderLinkIconAdditionalAttributes
      }
    },
    {
      mocks,
      provide: mocks,
      store,
      pluginOptions: {
        piniaOptions: { spacesState: { spaces }, capabilityState: { capabilities } }
      }
    }
  )
}
