import Preview from './preview'
import List from './list'
import { Store } from 'vuex'
import { Router } from 'vue-router'
import { SearchFunction, SearchList, SearchPreview, SearchProvider } from '@ownclouders/web-pkg'

function $gettext(msg) {
  return msg
}

export default class Provider implements SearchProvider {
  public readonly id: string
  public readonly displayName: string
  public readonly previewSearch: SearchPreview
  public readonly listSearch: SearchList
  private readonly store: Store<any>

  constructor(store: Store<any>, router: Router, searchFunction: SearchFunction) {
    this.id = 'files.sdk'
    this.displayName = $gettext('Files')
    this.previewSearch = new Preview(router, searchFunction)
    this.listSearch = new List(searchFunction)
    this.store = store
  }

  public get available(): boolean {
    return this.store.getters.capabilities?.dav?.reports?.includes('search-files')
  }
}
