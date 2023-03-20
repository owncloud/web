import { SDKSearch } from '../../../src/search'
import { ClientService } from 'web-pkg/src/services'
import { Store } from 'vuex'
import { RouteLocation, Router } from 'vue-router'
import { mock, mockDeep } from 'jest-mock-extended'
import { ref } from 'vue'

const searchMock = jest.fn()
const clientService = mockDeep<ClientService>()
clientService.owncloudSdk.files.search.mockImplementation(searchMock)

jest.mock('web-client/src/helpers', () => ({
  buildResource: (v) => v
}))

const store = mockDeep<Store<any>>({
  getters: {
    user: () => ({ id: 1 }),
    capabilities: {
      dav: {
        reports: ['search-files']
      }
    }
  }
})

const storeWithoutFileSearch = mockDeep<Store<any>>({
  getters: { capabilities: { dav: { reports: [] } } }
})

describe('SDKProvider', () => {
  it('is only available if announced via capabilities', () => {
    const search = new SDKSearch(storeWithoutFileSearch, mock<Router>(), clientService)
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
          store,
          mock<Router>({
            currentRoute: ref(mock<RouteLocation>({ name: v.route }))
          }),
          clientService
        )

        expect(!!search.previewSearch.available).toBe(!!v.available)
      })
    })

    it('can search', async () => {
      const search = new SDKSearch(store, mock<Router>(), clientService)
      const files = [
        { id: 'foo', name: 'foo' },
        { id: 'bar', name: 'bar' },
        { id: 'baz', name: 'baz' }
      ]

      const noTerm = await search.previewSearch.search('')
      expect(noTerm).toEqual({ totalResults: null, values: [] })

      searchMock.mockReturnValueOnce({ results: files })
      const withTerm = await search.previewSearch.search('foo')
      expect(withTerm.values.map((r) => r.data)).toMatchObject(files)

      const withTermCached = await search.previewSearch.search('foo')
      expect(withTermCached.values.map((r) => r.data)).toMatchObject(files)
    })
  })
  describe('SDKProvider listSearch', () => {
    it('can search', async () => {
      const search = new SDKSearch(store, mock<Router>(), clientService)
      const files = [
        { id: 'foo', name: 'foo' },
        { id: 'bar', name: 'bar' },
        { id: 'baz', name: 'baz' }
      ]

      searchMock.mockReturnValueOnce({ results: files })
      const withTerm = (await search.listSearch.search('foo')) as any
      expect(withTerm.values.map((r) => r.data)).toMatchObject(files)
    })
  })
})
