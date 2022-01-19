import { SearchPreview, SearchResult } from 'search/src/types'
import PreviewComponent from '../../components/Search/Preview.vue'
import { clientService } from 'web-pkg/src/services'
import { buildResource } from '../../helpers/resources'
import { Cache } from 'web-pkg/src/cache'
import { debounce } from 'web-pkg/src/decorator'
import { Component } from 'vue'
import VueRouter from 'vue-router'
import { DavProperties } from 'web-pkg/src/constants'

export default class Preview implements SearchPreview {
  public readonly component: Component
  private readonly cache: Cache<string, SearchResult[]>
  private readonly router: VueRouter

  constructor(router: VueRouter) {
    this.component = PreviewComponent
    this.router = router
    // define how long the cache should be valid, maybe conf option?
    this.cache = new Cache({ ttl: 10000, capacity: 100 })
  }

  // we need to change the architecture of oc-sdk to be able to use cancelTokens
  // every search requests hammers the backend even if it's not needed anymore..
  // for now we worked around it by using a cache mechanism and make use of debouncing
  @debounce(500)
  public async search(term: string): Promise<SearchResult[]> {
    if (!term) {
      return
    }

    if (this.cache.has(term)) {
      return this.cache.get(term)
    }

    const plainResources = await clientService.owncloudSdk.files.search(
      term,
      5, // todo: add configuration option, other places need that too... needs consolidation
      DavProperties.Default
    )

    return this.cache.set(
      term,
      plainResources.map((plainResource) => {
        const resource = buildResource(plainResource)
        return { id: resource.id, data: resource }
      })
    )
  }

  public get available(): boolean {
    return this.router.currentRoute.name !== 'search-provider-list'
  }

  public activate(): void {
    /* not needed */
  }
}
