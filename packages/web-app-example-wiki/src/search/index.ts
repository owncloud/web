import { SearchProvider, SearchPreview, SearchList } from 'search/src/types'
import { EventBus } from 'web-pkg/src/event'
import VueRouter from 'vue-router'
import Preview from './preview'
import List from './list'

export class WikiSearch extends EventBus implements SearchProvider {
  public readonly id: string
  public readonly label: string
  public readonly previewSearch: SearchPreview
  public readonly listSearch: SearchList
  private readonly router: VueRouter

  constructor(router: VueRouter) {
    super()

    this.id = 'example.wiki'
    this.label = 'Search wiki ↵'
    this.router = router
    this.previewSearch = new Preview(router)
    this.listSearch = new List()
  }

  public activate(term: string): void {
    const listRoute = 'search-provider-list'

    if (!term && this.router.currentRoute.name !== listRoute) {
      return
    }

    this.router
      .push({
        name: listRoute,
        query: { term, provider: this.id }
      })
      .catch(() => {
        // Uncaught (in promise) NavigationDuplicated: Avoided redundant navigation to current location: "/search/list/files.global?term=a"
      })
  }

  public reset(): void {
    /* not needed */
  }

  public updateTerm(): void {
    /* not needed */
  }

  public get available(): boolean {
    return true
  }
}
