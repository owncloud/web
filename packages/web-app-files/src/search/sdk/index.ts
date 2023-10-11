import Preview from './preview'
import List from './list'
import { EventBus } from '@ownclouders/web-pkg'
import { Store } from 'vuex'
import { Router } from 'vue-router'
import {
  ClientService,
  ConfigurationManager,
  SearchList,
  SearchPreview,
  SearchProvider
} from '@ownclouders/web-pkg'

function $gettext(msg) {
  return msg
}
export default class Provider extends EventBus implements SearchProvider {
  public readonly id: string
  public readonly displayName: string
  public readonly previewSearch: SearchPreview
  public readonly listSearch: SearchList
  private readonly store: Store<any>
  private readonly router: Router

  constructor(
    store: Store<any>,
    router: Router,
    clientService: ClientService,
    configurationManager: ConfigurationManager
  ) {
    super()

    this.id = 'files.sdk'
    this.displayName = $gettext('Files')
    this.previewSearch = new Preview(store, router, clientService, configurationManager)
    this.listSearch = new List(store, clientService, configurationManager)
    this.store = store
    this.router = router
  }

  public get available(): boolean {
    return this.store.getters.capabilities?.dav?.reports?.includes('search-files')
  }
}
