import DriveResolver from '../../../../src/views/spaces/DriveResolver.vue'
import { useDriveResolver } from '@ownclouders/web-pkg'
import { computed, ref } from 'vue'
import { mock, mockDeep } from 'jest-mock-extended'
import { ClientService } from '@ownclouders/web-pkg'
import { useGetMatchingSpace } from '@ownclouders/web-pkg'
import { locationPublicUpload } from '@ownclouders/web-pkg'
import { PublicSpaceResource, Resource, SpaceResource } from 'web-client/src/helpers'
import { SharePermissionBit } from 'web-client/src/helpers/share'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks,
  defaultStubs,
  RouteLocation
} from 'web-test-helpers'
import { useGetMatchingSpaceMock } from '@ownclouders/web-pkg'

jest.mock('@ownclouders/web-pkg')

describe('DriveResolver view', () => {
  it('renders the "drive-redirect"-component when no space is given', async () => {
    const { wrapper } = getMountedWrapper()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('drive-redirect-stub').exists()).toBeTruthy()
  })
  it('renders the "generic-trash"-component when on a trash route', async () => {
    const { wrapper } = getMountedWrapper({
      space: mockDeep<SpaceResource>({ driveType: 'project' }),
      currentRouteName: 'files-trash-generic'
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('generic-trash-stub').exists()).toBeTruthy()
  })
  it('renders the "generic-space"-component when a space is given', async () => {
    const { wrapper } = getMountedWrapper({
      space: mockDeep<SpaceResource>({ driveType: 'project' })
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('generic-space-stub').exists()).toBeTruthy()
  })
  it('redirects to the public drop page in a public context with "upload-only"-permissions', async () => {
    const space = { id: '1', getDriveAliasAndItem: jest.fn(), driveType: 'public' }
    const clientService = mockDeep<ClientService>()
    clientService.webdav.getFileInfo.mockResolvedValue(
      mockDeep<PublicSpaceResource>({ publicLinkPermission: SharePermissionBit.Create })
    )
    const { wrapper, mocks } = getMountedWrapper({
      space,
      mocks: { $clientService: clientService }
    })

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(mocks.$router.push).toHaveBeenCalledWith({
      name: locationPublicUpload.name,
      params: { token: space.id }
    })
  })
  it('redirects to personal space if user has access to the resource via their personal space', async () => {
    const space = { id: '1', getDriveAliasAndItem: jest.fn(), driveType: 'public' }
    const internalSpace = { id: '1', getDriveAliasAndItem: jest.fn(), driveType: 'personal' }
    const clientService = mockDeep<ClientService>()
    clientService.webdav.getPathForFileId.mockResolvedValue('/path')
    clientService.webdav.getFileInfo.mockResolvedValue(mock<Resource>())
    const { wrapper, mocks } = getMountedWrapper({
      space,
      internalSpace,
      mocks: { $clientService: clientService },
      isUserContextReady: true
    })

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(mocks.$router.push).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'files-spaces-generic' })
    )
  })
  it('redirects to private link if user has access to the resource via a share', async () => {
    const space = { id: '1', getDriveAliasAndItem: jest.fn(), driveType: 'public' }
    const clientService = mockDeep<ClientService>()
    clientService.webdav.getPathForFileId.mockResolvedValue('/path')
    const { wrapper, mocks } = getMountedWrapper({
      space,
      mocks: { $clientService: clientService },
      isUserContextReady: true
    })

    await wrapper.vm.$nextTick()
    expect(mocks.$router.push).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'resolvePrivateLink',
        query: { openWithDefaultApp: 'false' }
      })
    )
  })
})

function getMountedWrapper({
  mocks = {},
  space = undefined,
  internalSpace = undefined,
  currentRouteName = 'files-spaces-generic',
  isUserContextReady = false
} = {}) {
  jest.mocked(useDriveResolver).mockImplementation(() => ({
    space,
    item: ref('/'),
    itemId: computed(() => 'id'),
    loading: ref(false)
  }))
  jest.mocked(useGetMatchingSpace).mockImplementation(() =>
    useGetMatchingSpaceMock({
      getInternalSpace: (storageId: string) => internalSpace
    })
  )

  const defaultMocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({
        name: currentRouteName,
        params: { driveAliasAndItem: '/' }
      })
    }),
    ...(mocks && mocks)
  }
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.modules.runtime.modules.auth.getters.isUserContextReady.mockReturnValue(
    isUserContextReady
  )
  const store = createStore(storeOptions)
  return {
    mocks: defaultMocks,
    storeOptions,
    wrapper: mount(DriveResolver, {
      global: {
        plugins: [...defaultPlugins(), store],
        mocks: defaultMocks,
        provide: defaultMocks,
        stubs: { ...defaultStubs, 'app-banner': true }
      }
    })
  }
}
