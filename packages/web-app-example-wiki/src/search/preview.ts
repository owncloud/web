import { SearchPreview, SearchResult } from 'search/src/types'
import { Cache } from 'web-pkg/src/cache'
import { debounce } from 'web-pkg/src/decorator'
import { Component } from 'vue'
import VueRouter from 'vue-router'
import PreviewComponent from '../components/Search/Preview.vue'
import { wikiService } from '../services'

export default class Preview implements SearchPreview {
  public readonly component: Component
  private readonly cache: Cache<string, SearchResult[]>
  private readonly router: VueRouter

  constructor(router: VueRouter) {
    this.component = PreviewComponent
    this.router = router
    this.cache = new Cache({ ttl: 10000, capacity: 100 })
  }

  @debounce(500)
  public async search(term: string): Promise<SearchResult[]> {
    if (!term) {
      return
    }

    if (this.cache.has(term)) {
      return this.cache.get(term)
    }

    const searchResult = await wikiService.search(term, 5)

    return this.cache.set(term, searchResult)
  }

  public activate(resource: SearchResult): void {
    const { pageid = 35507 } = resource.data as any
    console.log(this.router)
    this.router
      .push({
        name: 'wiki-page',
        params: { id: pageid }
      })
      .catch(() => {
        // Uncaught (in promise) NavigationDuplicated: Avoided redundant navigation to current location: "/search/list/files.global?term=a"
      })
  }

  public get available(): boolean {
    return true
  }
}
