import { SearchList, SearchResult } from 'search/src/types'
import ListComponent from '../../components/Search/List.vue'
import { clientService } from 'web-pkg/src/services'
import { buildResource } from '../../helpers/resources'
import { Component } from 'vue'
import { DavProperties } from 'web-pkg/src/constants'

export const searchLimit = 200

export default class List implements SearchList {
  public readonly component: Component

  constructor() {
    this.component = ListComponent
  }

  async search(term: string): Promise<SearchResult> {
    if (!term) {
      return {
        range: null,
        values: []
      }
    }

    const { range, results } = await clientService.owncloudSdk.files.search(
      term,
      searchLimit,
      DavProperties.Default
    )

    return {
      range,
      values: results.map((result) => {
        const resource = buildResource(result)
        return { id: resource.id, data: resource }
      })
    }
  }
}