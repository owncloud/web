import { SearchPreview, SearchResult } from 'web-app-search/src/types'
import PreviewComponent from '../../components/Search/Preview.vue'
import { ClientService } from 'web-pkg/src/services'
import { ProjectSpaceResource, buildResource, isProjectSpaceResource } from 'web-client/src/helpers'
import { Cache } from 'web-pkg/src/helpers/cache'
import { Component, computed, Ref, unref } from 'vue'
import { Router } from 'vue-router'
import { DavProperties, DavProperty } from 'web-client/src/webdav/constants'
import { Store } from 'vuex'

export const previewSearchLimit = 8

export default class Preview implements SearchPreview {
  public readonly component: Component
  private readonly cache: Cache<string, SearchResult>
  private readonly router: Router
  private readonly store: Store<any>
  private readonly clientService: ClientService
  private readonly projectSpaces: Ref<ProjectSpaceResource[]>

  constructor(store: Store<any>, router: Router, clientService: ClientService) {
    this.component = PreviewComponent
    this.router = router
    this.store = store
    // define how long the cache should be valid, maybe conf option?
    this.cache = new Cache({ ttl: 10000, capacity: 100 })
    this.clientService = clientService
    this.projectSpaces = computed(() =>
      this.store.getters['runtime/spaces/spaces'].filter((s) => isProjectSpaceResource(s))
    )
  }

  getMatchingSpace(id: string): ProjectSpaceResource {
    return unref(this.projectSpaces).find((s) => s.id === id)
  }

  public async search(term: string): Promise<SearchResult> {
    if (!term) {
      return {
        totalResults: null,
        values: []
      }
    }

    if (this.cache.has(term)) {
      return this.cache.get(term)
    }

    await this.store.dispatch('runtime/spaces/loadMountPoints', {
      graphClient: this.clientService.graphAuthenticated
    })

    const areHiddenFilesShown = this.store.state.Files?.areHiddenFilesShown
    const useSpacesEndpoint = this.store.getters.capabilities?.spaces?.enabled === true

    const { range, results } = await this.clientService.owncloudSdk.files.search(
      term,
      previewSearchLimit, // todo: add configuration option, other places need that too... needs consolidation
      DavProperties.Default,
      useSpacesEndpoint
    )
    const resources = results.reduce((acc, result) => {
      const matchingSpace = this.getMatchingSpace(result.fileInfo[DavProperty.FileParent])
      const resource = matchingSpace ? matchingSpace : buildResource(result)
      // info: in oc10 we have no storageId in resources. All resources are mounted into the personal space.
      if (!resource.storageId) {
        resource.storageId = this.store.getters.user.id
      }

      // filter results if hidden files shouldn't be shown due to settings
      if (!resource.name.startsWith('.') || areHiddenFilesShown) {
        acc.push({ id: resource.id, data: { ...resource } })
      }

      return acc
    }, [])
    return this.cache.set(term, {
      totalResults: range ? parseInt(range?.split('/')[1]) : null,
      values: resources
    })
  }

  public get available(): boolean {
    return unref(this.router.currentRoute).name !== 'search-provider-list'
  }
}
