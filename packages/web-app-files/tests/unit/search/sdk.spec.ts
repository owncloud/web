import { SDKSearch } from '../../../src/search'
import { ClientService } from 'web-pkg/src/services'
import { Store } from 'vuex'
import { RouteLocation, Router } from 'vue-router'
import { mock, mockDeep } from 'jest-mock-extended'
import { ref } from 'vue'
import { createStore, defaultStoreMockOptions } from 'web-test-helpers/src'
import { ProjectSpaceResource } from 'web-client/src/helpers'
import { DavProperty } from 'web-client/src/webdav/constants'
import { ConfigurationManager } from 'web-pkg/src'

const searchMock = jest.fn()
const clientService = mockDeep<ClientService>()
clientService.owncloudSdk.files.search.mockImplementation(searchMock)
const configurationManager = mockDeep<ConfigurationManager>({
  options: {
    routing: {
      fullShareOwnerPaths: false
    }
  }
})
jest.mock('web-client/src/helpers/resource', () => ({
  buildResource: (v) => v
}))

const getStore = (spaces = []) => {
  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.capabilities.mockReturnValue({ dav: { reports: ['search-files'] } })
  storeOptions.modules.runtime.modules.spaces.getters.spaces.mockReturnValue(spaces)
  return createStore(storeOptions)
}

const storeWithoutFileSearch = mockDeep<Store<any>>({
  getters: { capabilities: { dav: { reports: [] } } }
})

describe('SDKProvider', () => {
  it('is only available if announced via capabilities', () => {
    const search = new SDKSearch(
      storeWithoutFileSearch,
      mock<Router>(),
      clientService,
      configurationManager
    )
    expect(search.available).toBe(false)
  })

  describe('SDKProvider previewSearch', () => {
    it('is not available on certain routes', () => {
      ;[
        { route: 'foo', available: true },
        { route: 'search-provider-list' },
        { route: 'bar', available: true }
      ].forEach((v) => {
        const search = new SDKSearch(
          getStore(),
          mock<Router>({
            currentRoute: ref(mock<RouteLocation>({ name: v.route }))
          }),
          clientService,
          configurationManager
        )

        expect(!!search.previewSearch.available).toBe(!!v.available)
      })
    })

    it('can search', async () => {
      const search = new SDKSearch(getStore(), mock<Router>(), clientService, configurationManager)
      const files = [
        { id: 'foo', name: 'foo', fileInfo: {} },
        { id: 'bar', name: 'bar', fileInfo: {} },
        { id: 'baz', name: 'baz', fileInfo: {} }
      ]

      const noTerm = await search.previewSearch.search('')
      expect(noTerm).toEqual({ totalResults: null, values: [] })

      searchMock.mockReturnValueOnce({ results: files })
      const withTerm = await search.previewSearch.search('foo')
      expect(withTerm.values.map((r) => r.data)).toMatchObject(files)

      const withTermCached = await search.previewSearch.search('foo')
      expect(withTermCached.values.map((r) => r.data)).toMatchObject(files)
    })
    it('properly returns space resources', async () => {
      const spaceId = '1'
      const space = mock<ProjectSpaceResource>({ id: spaceId, name: 'foo', driveType: 'project' })
      const search = new SDKSearch(
        getStore([space]),
        mock<Router>(),
        clientService,
        configurationManager
      )
      const files = [{ id: 'foo', name: 'foo', fileInfo: { [DavProperty.FileParent]: space.id } }]

      searchMock.mockReturnValueOnce({ results: files })
      const withTerm = (await search.previewSearch.search('foo')) as any
      expect(withTerm.values.map((r) => r.data)[0].id).toEqual(spaceId)
    })
  })
  describe('SDKProvider listSearch', () => {
    it('can search', async () => {
      const search = new SDKSearch(getStore(), mock<Router>(), clientService, configurationManager)
      const files = [
        { id: 'foo', name: 'foo', fileInfo: {} },
        { id: 'bar', name: 'bar', fileInfo: {} },
        { id: 'baz', name: 'baz', fileInfo: {} }
      ]

      searchMock.mockReturnValueOnce({ results: files })
      const withTerm = (await search.listSearch.search('foo')) as any
      expect(withTerm.values.map((r) => r.data)).toMatchObject(files)
    })
    it('properly returns space resources', async () => {
      const spaceId = '1'
      const space = mock<ProjectSpaceResource>({ id: spaceId, driveType: 'project' })
      const search = new SDKSearch(
        getStore([space]),
        mock<Router>(),
        clientService,
        configurationManager
      )
      const files = [{ id: 'foo', name: 'foo', fileInfo: { [DavProperty.FileParent]: space.id } }]

      searchMock.mockReturnValueOnce({ results: files })
      const withTerm = (await search.listSearch.search('foo')) as any
      expect(withTerm.values.map((r) => r.data)[0].id).toEqual(spaceId)
    })
  })
})
