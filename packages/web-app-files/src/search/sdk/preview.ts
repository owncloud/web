import { SearchPreview, SearchResult } from 'search/src/types'
import PreviewComponent from '../../components/Search/Preview.vue'
import { clientService } from 'web-pkg/src/services'
import { buildResource } from '../../helpers/resources'
import { Cache } from 'web-pkg/src/helpers/cache'
import { debounce } from 'web-pkg/src/decorator'
import { Component } from 'vue'
import VueRouter from 'vue-router'
import { DavProperties } from 'web-pkg/src/constants'
import { Store } from 'vuex'

export const previewSearchLimit = 5

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
        range: null,
        values: []
      }
    }

    if (this.cache.has(term)) {
      return this.cache.get(term)
    }

    const areHiddenFilesShown = this.store.state.Files?.areHiddenFilesShown
    const { range, results } = await clientService.owncloudSdk.files.search(
      term,
      previewSearchLimit, // todo: add configuration option, other places need that too... needs consolidation
      DavProperties.Default
    )
    const resources = results.reduce((acc, result) => {
      const resource = buildResource(result)

      // filter results if hidden files shouldn't be shown due to settings
      if (!resource.name.startsWith('.') || areHiddenFilesShown) {
        acc.push({ id: resource.id, data: { ...resource } })
      }

      return acc
    }, [])
    return this.cache.set(term, { range, values: resources })
  }

  public get available(): boolean {
    return this.router.currentRoute.name !== 'search-provider-list'
  }

  public activate(): void {
    /* not needed */
  }
}