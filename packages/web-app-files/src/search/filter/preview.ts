import { SearchPreview, SearchResult } from 'search/src/types'
import PreviewComponent from '../../components/Search/Preview.vue'
import { filterResources } from '../../helpers/resource'
import { Store } from 'vuex'
import { Component } from 'vue'

export default class Preview implements SearchPreview {
  public readonly component: Component
  public readonly available: boolean
  private readonly store: Store<any>

  constructor(store: Store<any>) {
    this.component = PreviewComponent
    this.store = store
    this.available = true
  }

  public search(term: string): Promise<SearchResult[]> {
    // no cache required, the filtering is client only and fast enough to recalculate the set
    // of results every time on the fly
    const resources: any[] = filterResources(this.store.getters['Files/files'], term, 5)
    const searchResult = resources.map((resource) => ({ id: resource.id, data: { ...resource } }))

    return Promise.resolve(searchResult)
  }

  public activate(): void {
    /* not needed */
  }
}
