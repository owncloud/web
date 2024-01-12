import { SDKSearch } from '../../../src/search'
import { Store } from 'vuex'
import { RouteLocation, Router } from 'vue-router'
import { mock, mockDeep } from 'jest-mock-extended'
import { ref } from 'vue'
import { createStore, defaultStoreMockOptions } from 'web-test-helpers/src'

jest.mock('@ownclouders/web-client/src/helpers/resource', () => ({
  buildResource: (v) => v
}))

const getStore = () => {
  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.capabilities.mockReturnValue({ dav: { reports: ['search-files'] } })
  return createStore(storeOptions)
}

const storeWithoutFileSearch = mockDeep<Store<any>>({
  getters: { capabilities: { dav: { reports: [] } } }
})

describe('SDKProvider', () => {
  it('is only available if announced via capabilities', () => {
    const search = new SDKSearch(storeWithoutFileSearch, mock<Router>(), jest.fn())
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
          jest.fn()
        )

        expect(!!search.previewSearch.available).toBe(!!v.available)
      })
    })
  })
})
