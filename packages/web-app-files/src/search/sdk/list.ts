import ListComponent from '../../components/Search/List.vue'
import { clientService } from 'web-pkg/src/services'
import { buildResource } from 'web-client/src/helpers'
import { Component } from 'vue'
import { DavProperties } from 'web-client/src/webdav/constants'
import { Store } from 'vuex'
import { SearchList, SearchResult } from '../../../../web-app-search/src/types'

export const searchLimit = 200

export default class List implements SearchList {
  public readonly component: Component
  private readonly store: Store<any>

  constructor(store: Store<any>) {
    this.component = ListComponent
    this.store = store
  }

  async search(term: string): Promise<SearchResult> {
    if (!term) {
      return {
        totalResults: null,
        values: []
      }
    }

    const { range, results } = await clientService.owncloudSdk.files.search(
      term,
      searchLimit,
      DavProperties.Default
    )

    return {
      totalResults: range ? parseInt(range?.split('/')[1]) : null,
      values: results.map((result) => {
        const resource = buildResource(result)
        // info: in oc10 we have no storageId in resources. All resources are mounted into the personal space.
        if (!resource.storageId) {
          resource.storageId = this.store.getters.user.id
        }
        return { id: resource.id, data: resource }
      })
    }
  }
}
