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

  public search(term: string): Promise<SearchResult> {
    // no cache required, the filtering is client only and fast enough to recalculate the set
    // of results every time on the fly
    const resources: any[] = filterResources(this.store.getters['Files/files'], term, 5)
    const areHiddenFilesShown = this.store.state.Files?.areHiddenFilesShown

    const searchResult = resources.reduce((acc, resource) => {
      // filter results if hidden files shouldn't be shown due to settings
      if (!resource.name.startsWith('.') || areHiddenFilesShown) {
        acc.push({ id: resource.id, data: { ...resource } })
      }

      return acc
    }, [])

    return Promise.resolve({ values: searchResult })
  }

  public activate(): void {
    /* not needed */
  }
}
