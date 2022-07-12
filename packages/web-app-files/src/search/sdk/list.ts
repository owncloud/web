import { SearchList, SearchResult } from 'search/src/types'
import ListComponent from '../../components/Search/List.vue'
import { clientService } from 'web-pkg/src/services'
import { buildResource } from '../../helpers/resources'
import { Component } from 'vue'
import { DavProperties } from 'web-pkg/src/constants'

export const searchLimit = 300

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
      searchLimit,
      DavProperties.Default
    )

    return plainResources.map((plainResource) => {
      let resourceName = decodeURIComponent(plainResource.name)
      if (resourceName.startsWith('/dav')) {
        resourceName = resourceName.slice(4)
      }

      const resource = buildResource({ ...plainResource, name: resourceName })
      return { id: resource.id, data: resource }
    })
  }
}
