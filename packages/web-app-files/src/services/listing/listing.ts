import { Store } from 'vuex'
import { View } from '../../types/view'
import { DavProperties, DavProperty } from 'web-pkg/src/constants'
import resource, { MutationType as ResourceMutationType } from '../../store/modules/resource'
import {
  buildStoreModuleIdentifier,
  MutationType as ListingMutationType
} from '../../store/modules/listing'
import OwnCloud from 'owncloud-sdk'
import { ResourceLoader } from './loader'
import { RuntimeError } from 'web-runtime/src/container/error'

export class ListingService {
  store: Store<any>
  sdk: OwnCloud
  loaders: Map<View, ResourceLoader>

  public initialize(store: Store<any>, sdk: OwnCloud): void {
    this.store = store
    this.sdk = sdk
    this.loaders = new Map<View, ResourceLoader>()
  }

  public registerResourceLoader(view: View, loader: ResourceLoader) {
    this.loaders.set(view, loader)
  }

  public async loadResources(
    view: View,
    path: string,
    davProperties: DavProperty[] = DavProperties.Default
  ): Promise<void> {
    if (!this.loaders.has(view)) {
      throw new RuntimeError(`unknown view ${view} in listingService`)
    }

    // init store module for the view & path
    const identifier = buildStoreModuleIdentifier(view, path)
    this.store.registerModule(identifier, resource)
    this.store.mutations[`Files/${identifier}/${ResourceMutationType.SET_LOADING}`](true)
    this.store.mutations[`Files/${identifier}/${ResourceMutationType.SET_PATH}`](path)

    // announce new view & path in `listing` store module
    this.store.mutations[`Files/listing/${ListingMutationType.SET_ACTIVE_VIEW_AND_PATH}`]({ view, path })

    // load resources
    const resourceNode = await this.loaders
      .get(view)
      .loadResources(this.sdk, path, davProperties)
      .catch(e => {
        console.error(e)
        // TODO: set error state in store?
        this.store.mutations[`Files/${identifier}/${ResourceMutationType.SET_LOADING}`](false)
        return Promise.reject(e)
      })
    this.store.mutations[`Files/${identifier}/${ResourceMutationType.SET_PARENT}`](resourceNode.parent)
    this.store.mutations[`Files/${identifier}/${ResourceMutationType.SET_CHILDREN}`](
      resourceNode.children
    )

    // exit `loading` state
    this.store.mutations[`Files/${identifier}/${ResourceMutationType.SET_LOADING}`](false)
  }
}

export const listingService = new ListingService()
