import { SearchList, SearchResult } from 'search/src/types'
import ListComponent from '../../components/Search/List.vue'
import { clientService } from '../../services'
import { buildResource } from '../../helpers/resources'
import { Store } from 'vuex'
import { Component } from 'vue'

export default class List implements SearchList {
  public readonly component: Component
  private readonly store: Store<any>

  constructor(store: Store<any>) {
    this.component = ListComponent
    this.store = store
  }

  async search(term: string): Promise<SearchResult[]> {
    if (!term) {
      return []
    }

    const plainResources = await clientService.owncloudSdk.files.search(
      term,
      undefined,
      this.store.getters['Files/davProperties']
    )

    return plainResources.map(plainResource => {
      const resource = buildResource(plainResource)
      return { id: resource.id, data: resource }
    })
  }
}
