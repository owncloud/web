import { SearchFunction, SearchPreview, SearchResult } from '@ownclouders/web-pkg'
import { Component, unref } from 'vue'
import { Router } from 'vue-router'
import { ResourcePreview } from '@ownclouders/web-pkg'

export const previewSearchLimit = 8

export default class Preview implements SearchPreview {
  public readonly component: Component
  private readonly router: Router
  private readonly searchFunction: SearchFunction

  constructor(router: Router, searchFunction: SearchFunction) {
    this.component = ResourcePreview
    this.router = router
    this.searchFunction = searchFunction
  }

  public async search(term: string): Promise<SearchResult> {
    return this.searchFunction(term, previewSearchLimit)
  }

  public get available(): boolean {
    return unref(this.router.currentRoute).name !== 'search-provider-list'
  }
}
