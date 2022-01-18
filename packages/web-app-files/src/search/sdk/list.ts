import { SearchList, SearchResult } from 'search/src/types'
import ListComponent from '../../components/Search/List.vue'
import { clientService } from 'web-pkg/src/services'
import { buildResource } from '../../helpers/resources'
import { Component } from 'vue'
import { DavProperties } from 'web-pkg/src/constants'

export default class List implements SearchList {
  public readonly component: Component

  constructor() {
    this.component = ListComponent
  }

  async search(term: string): Promise<SearchResult[]> {
    if (!term) {
      return []
    }

    const plainResources = await clientService.owncloudSdk.files.search(
      term,
      undefined,
      DavProperties.Default
    )

    return plainResources.map((plainResource) => {
      const resource = buildResource(plainResource)
      return { id: resource.id, data: resource }
    })
  }
}
