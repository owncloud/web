import { SearchProvider, SearchPreview } from 'search/src/types'
import Preview from './preview'
import { EventBus } from 'web-pkg/src/event'
import { filterResources } from '../../helpers/resource'
import { Store } from 'vuex'
import VueRouter from 'vue-router'

function $gettext(msg) {
  return msg
}
export default class Provider extends EventBus implements SearchProvider {
  public readonly id: string
  public readonly label: string
  public readonly previewSearch: SearchPreview
  private readonly store: Store<any>
  private readonly router: VueRouter

  constructor(store: Store<any>, router: VueRouter) {
    super()

    this.id = 'files.filter'
    this.label = $gettext('Search current folder ↵')
    this.store = store
    this.router = router
    this.previewSearch = new Preview(store)
  }

  public activate(term: string): void {
    const resources = filterResources(this.store.getters['Files/files'], term)
    this.emit('activate', { term, resources })
  }

  public reset(): void {
    this.emit('reset')
  }

  public updateTerm(term: string): void {
    this.emit('updateTerm', term)
  }

  public get available(): boolean {
    return ['files-personal'].includes(this.router.currentRoute.name)
  }
}
