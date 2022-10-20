import { SearchProvider, SearchList, SearchPreview } from 'web-app-search/src/types'
import Preview from './preview'
import List from './list'
import { EventBus } from 'web-pkg/src/services/eventBus'
import { Store } from 'vuex'
import VueRouter from 'vue-router'

function $gettext(msg) {
  return msg
}
export default class Provider extends EventBus implements SearchProvider {
  public readonly id: string
  public readonly displayName: string
  public readonly previewSearch: SearchPreview
  public readonly listSearch: SearchList
  private readonly store: Store<any>
  private readonly router: VueRouter

  constructor(store: Store<any>, router: VueRouter) {
    super()

    this.id = 'files.sdk'
    this.displayName = $gettext('Files')
    this.previewSearch = new Preview(store, router)
    this.listSearch = new List(store)
    this.store = store
    this.router = router
  }

  public get available(): boolean {
    return this.store.getters.capabilities?.dav?.reports?.includes('search-files')
  }
}
