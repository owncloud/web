import { SearchProvider, SearchList, SearchPreview } from 'search/src/types'
import Preview from './preview'
import List from './list'
import { EventBus } from 'web-pkg/src/event'
import { Store } from 'vuex'
import VueRouter from 'vue-router'

function $gettext(msg) {
  return msg
}
export default class Provider extends EventBus implements SearchProvider {
  public readonly id: string
  public readonly label: string
  public readonly previewSearch: SearchPreview
  public readonly listSearch: SearchList
  private readonly store: Store<any>
  private readonly router: VueRouter

  constructor(store: Store<any>, router: VueRouter) {
    super()

    this.id = 'files.sdk'
    this.label = $gettext('Search all files ↵')
    this.previewSearch = new Preview(store, router)
    this.listSearch = new List()
    this.store = store
    this.router = router
  }

  public activate(term: string): void {
    const listRoute = 'files-common-search'

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
    return this.store.getters.capabilities?.dav?.reports?.includes('search-files')
  }
}