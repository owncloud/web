import { SearchList, SearchResult } from 'search/src/types'
import { Component } from 'vue'
import ListComponent from '../components/Search/List.vue'
import { wikiService } from '../services'

export default class List implements SearchList {
  public readonly component: Component

  constructor() {
    this.component = ListComponent
  }

  async search(term: string): Promise<SearchResult[]> {
    const searchResult = await wikiService.search(term, 1000)
    return searchResult
  }
}
