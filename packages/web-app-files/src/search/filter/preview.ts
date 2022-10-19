import { SearchPreview, SearchResult } from 'web-app-search/src/types'
import PreviewComponent from '../../components/Search/Preview.vue'
import { filterResources } from '../../helpers/resource'
import { Store } from 'vuex'
import { Component, unref } from 'vue'
import { Router } from 'vue-router'

export default class Preview implements SearchPreview {
  public readonly component: Component
  private readonly router: Router
  private readonly store: Store<any>

  constructor(store: Store<any>, router: Router) {
    this.component = PreviewComponent
    this.router = router
    this.store = store
  }

  public search(term: string): Promise<SearchResult> {
    if (!term) {
      return Promise.resolve({
        totalResults: null,
        values: []
      })
    }
    // no cache required, the filtering is client only and fast enough to recalculate the set
    // of results every time on the fly
    const resources: any[] = filterResources(this.store.getters['Files/files'], term, 5)
    const areHiddenFilesShown = this.store.state.Files?.areHiddenFilesShown

    const searchResult = resources.reduce((acc, resource) => {
      // filter results if hidden files shouldn't be shown due to settings
      if (!resource.name.startsWith('.') || areHiddenFilesShown) {
        acc.push({ id: resource.id, data: { ...resource, storageId: 'eos' } })
      }

      return acc
    }, [])

    return Promise.resolve({ totalResults: searchResult.length, values: searchResult })
  }

  public get available(): boolean {
    return unref(this.router.currentRoute).name !== 'search-provider-list'
  }
}
