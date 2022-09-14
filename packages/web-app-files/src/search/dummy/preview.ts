import { SearchPreview, SearchResult } from 'search/src/types'
import PreviewComponent from './Preview.vue'
import { Cache } from 'web-pkg/src/helpers/cache'
import { debounce } from 'web-pkg/src/decorator'
import { Component } from 'vue'
import VueRouter from 'vue-router'
import { Store } from 'vuex'

export default class Preview implements SearchPreview {
  public readonly component: Component
  private readonly cache: Cache<string, SearchResult>
  private readonly router: VueRouter
  private readonly store: Store<any>

  constructor(store: Store<any>, router: VueRouter) {
    this.component = PreviewComponent
    this.router = router
    this.store = store
    // define how long the cache should be valid, maybe conf option?
    this.cache = new Cache({ ttl: 10000, capacity: 100 })
  }

  // we need to change the architecture of oc-sdk to be able to use cancelTokens
  // every search requests hammers the backend even if it's not needed anymore..
  // for now we worked around it by using a cache mechanism and make use of debouncing
  @debounce(500)
  public async search(term: string): Promise<SearchResult> {
    if (!term) {
      return {
        totalResults: null,
        values: []
      }
    }

    if (this.cache.has(term)) {
      return this.cache.get(term)
    }

    return this.cache.set(term, {
      totalResults: null,
      values: [
        { id: '1', data: 'Jan Ackermann' },
        { id: '2', data: 'Benedikt CoolMan' }
      ]
    })
  }

  public get available(): boolean {
    return true
  }

  public activate(): void {
    /* not needed */
  }
}
