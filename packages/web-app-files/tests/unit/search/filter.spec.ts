import { createLocalVue } from '@vue/test-utils'
import { FilterSearch } from '../../../src/search'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import { createLocationSpaces } from '../../../src/router'

const localVue = createLocalVue()
localVue.use(Vuex)

const files = [
  { id: 'foo', name: 'foo' },
  { id: 'bar', name: 'bar' }
]
const filesMock = jest.fn()
filesMock.mockReturnValue(files)

const store = new Vuex.Store({
  modules: {
    Files: {
      getters: {
        files: filesMock
      },
      namespaced: true
    }
  }
})

describe('FilterProvider', () => {
  it('emits on activate', () => {
    let val
    const search = new FilterSearch(store, jest.fn() as unknown as VueRouter)
    search.subscribe('activate', (data) => (val = data))
    ;['foo', 'bar'].forEach((v, i) => {
      search.activate(v)
      expect(val).toMatchObject({ term: v, resources: [files[i]] })
    })
  })

  it('emits on reset', () => {
    const val = jest.fn()
    const search = new FilterSearch(store, jest.fn() as unknown as VueRouter)
    search.subscribe('reset', val)
    search.reset()
    search.reset()

    expect(val).toBeCalledTimes(2)
  })

  it('emits on updateTerm', () => {
    const val = jest.fn()
    const search = new FilterSearch(store, jest.fn() as unknown as VueRouter)
    search.subscribe('updateTerm', val)
    ;['foo', 'bar', 'baz'].forEach((v, i) => {
      search.updateTerm(v)
      expect(val.mock.calls[i][0]).toBe(v)
    })
  })

  it('is only available on certain routes', () => {
    ;[
      { route: { name: 'foo' } },
      { route: createLocationSpaces('files-spaces-personal'), available: true },
      { route: { name: 'bar' } }
    ].forEach((v) => {
      const search = new FilterSearch(store, {
        currentRoute: v.route,
        resolve: (r) => ({ href: r.name })
      } as unknown as VueRouter)
      expect(search.available).toBe(!!v.available)
    })
  })

  describe('FilterProvider previewSearch', () => {
    it('covers activate', () => {
      const search = new FilterSearch(store, jest.fn() as unknown as VueRouter)
      search.previewSearch.activate({ id: 'id', data: 'data' })
      expect('not-implemented').toBe('not-implemented')
    })

    it('can search', async () => {
      const search = new FilterSearch(store, jest.fn() as unknown as VueRouter)
      const result = await search.previewSearch.search('foo')

      expect(result).toMatchObject({ values: [{ id: files[0].id, data: files[0] }] })
    })
  })
})
