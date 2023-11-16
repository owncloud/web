import resolvePrivateLink from '../../../src/pages/resolvePrivateLink.vue'
import {
  defaultPlugins,
  defaultComponentMocks,
  createStore,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import {
  ConfigurationManager,
  queryItemAsString,
  useConfigurationManager,
  useGetResourceContext
} from '@ownclouders/web-pkg'
import { Resource, SpaceResource } from '@ownclouders/web-client'

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  useRouteQuery: jest.fn(),
  useRouteParam: jest.fn(),
  queryItemAsString: jest.fn(),
  useGetResourceContext: jest.fn(),
  useConfigurationManager: jest.fn()
}))

const selectors = {
  loadingHeadline: '.oc-link-resolve-loading'
}

describe('resolvePrivateLink', () => {
  it('is in a loading state initially', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.find(selectors.loadingHeadline).exists()).toBeTruthy()
  })
  it('resolves to "files-spaces-generic" and passes the scrollTo query', async () => {
    const fileId = '1'
    const driveAliasAndItem = 'personal/home'
    const space = mock<SpaceResource>({ getDriveAliasAndItem: () => driveAliasAndItem })
    const resource = mock<Resource>({ fileId })
    const { wrapper, mocks } = getWrapper({ space, resource, fileId })
    await wrapper.vm.resolvePrivateLinkTask.last
    expect(mocks.$router.push).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'files-spaces-generic',
        params: expect.objectContaining({ driveAliasAndItem }),
        query: expect.objectContaining({ scrollTo: fileId })
      })
    )
  })
  it('resolves to "files-shares-with-me" for received single file shares', async () => {
    const fileId = '1'
    const driveAliasAndItem = 'shares/someShare'
    const space = mock<SpaceResource>({
      driveType: 'share',
      getDriveAliasAndItem: () => driveAliasAndItem
    })
    const resource = mock<Resource>({ fileId, type: 'file' })
    const { wrapper, mocks } = getWrapper({ space, resource, fileId, path: '/' })
    await wrapper.vm.resolvePrivateLinkTask.last
    expect(mocks.$router.push).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'files-shares-with-me' })
    )
  })
  it('passes the details query paramif given via query', async () => {
    const details = 'sharing'
    const { wrapper, mocks } = getWrapper({ details })
    await wrapper.vm.resolvePrivateLinkTask.last
    expect(mocks.$router.push).toHaveBeenCalledWith(
      expect.objectContaining({ query: expect.objectContaining({ details }) })
    )
  })
  describe('openWithDefaultApp', () => {
    it('correctly passes the openWithDefaultApp param if enabled and given via query', async () => {
      const { wrapper, mocks } = getWrapper()
      await wrapper.vm.resolvePrivateLinkTask.last
      expect(mocks.$router.push).toHaveBeenCalledWith(
        expect.objectContaining({ query: expect.objectContaining({ openWithDefaultApp: 'true' }) })
      )
    })
    it('does not pass the openWithDefaultApp param when details param is given', async () => {
      const { wrapper, mocks } = getWrapper({ details: 'sharing' })
      await wrapper.vm.resolvePrivateLinkTask.last
      expect(mocks.$router.push).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.not.objectContaining({ openWithDefaultApp: 'true' })
        })
      )
    })
    it('does not pass the openWithDefaultApp param when disabled via config', async () => {
      const { wrapper, mocks } = getWrapper({ openLinksWithDefaultApp: false })
      await wrapper.vm.resolvePrivateLinkTask.last
      expect(mocks.$router.push).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.not.objectContaining({ openWithDefaultApp: 'true' })
        })
      )
    })
    it('does not pass the openWithDefaultApp param when not requested via query', async () => {
      const { wrapper, mocks } = getWrapper({ openWithDefaultAppQuery: 'false' })
      await wrapper.vm.resolvePrivateLinkTask.last
      expect(mocks.$router.push).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.not.objectContaining({ openWithDefaultApp: 'true' })
        })
      )
    })
  })
})

function getWrapper({
  space = mock<SpaceResource>(),
  resource = mock<Resource>(),
  path = '',
  fileId = '',
  details = '',
  openWithDefaultAppQuery = 'true',
  openLinksWithDefaultApp = true
} = {}) {
  jest.mocked(queryItemAsString).mockReturnValueOnce(fileId)
  jest.mocked(queryItemAsString).mockReturnValueOnce(openWithDefaultAppQuery)
  jest.mocked(queryItemAsString).mockReturnValueOnce(details)

  jest.mocked(useGetResourceContext).mockReturnValue({
    getResourceContext: jest.fn().mockResolvedValue({ space, resource, path })
  })
  jest.mocked(useConfigurationManager).mockImplementation(() =>
    mock<ConfigurationManager>({
      options: {
        openLinksWithDefaultApp
      }
    })
  )

  const mocks = { ...defaultComponentMocks() }
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)

  return {
    mocks,
    wrapper: shallowMount(resolvePrivateLink, {
      global: {
        plugins: [...defaultPlugins(), store],
        mocks,
        provide: mocks
      }
    })
  }
}
