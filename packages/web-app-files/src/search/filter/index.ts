import { SearchProvider, SearchList, SearchPreview } from 'web-app-search/src/types'
import Preview from './preview'
import { EventBus } from 'web-pkg/src/services/eventBus'
import { filterResources } from '../../helpers/resource'
import { Store } from 'vuex'
import { Router } from 'vue-router'
import { isLocationSpacesActive } from '../../router'

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

  constructor(store: Store<any>, router: Router) {
    super()

    this.id = 'files.filter'
    this.displayName = $gettext('In this folder')
    this.store = store
    this.router = router
    this.previewSearch = new Preview(store, router)
  }

  public activate(term: string): void {
    if (!term) {
      return
    }

    const resources = filterResources(this.store.getters['Files/files'], term)
    this.publish('activate', { term, resources })
  }

  public reset(): void {
    this.publish('reset')
  }

  public updateTerm(term: string): void {
    this.publish('updateTerm', term)
  }

  public get available(): boolean {
    return (
      isLocationSpacesActive(this.router, 'files-spaces-generic') &&
      !isLocationSpacesActive(this.router, 'files-spaces-projects')
    )
  }
}
