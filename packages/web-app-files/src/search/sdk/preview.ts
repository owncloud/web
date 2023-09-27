import { SearchPreview, SearchResult } from 'web-app-search/src/types'
import PreviewComponent from '../../components/Search/Preview.vue'
import { ClientService, Cache } from '@ownclouders/web-pkg'
import { ProjectSpaceResource, isProjectSpaceResource } from 'web-client/src/helpers'
import { Component, computed, Ref, unref } from 'vue'
import { Router } from 'vue-router'
import { DavProperties } from 'web-client/src/webdav/constants'
import { Store } from 'vuex'
import { ConfigurationManager } from '@ownclouders/web-pkg'
import { urlJoin } from 'web-client/src/utils'

export const previewSearchLimit = 8

export default class Preview implements SearchPreview {
  public readonly component: Component
  private readonly cache: Cache<string, SearchResult>
  private readonly router: Router
  private readonly store: Store<any>
  private readonly clientService: ClientService
  private readonly configurationManager: ConfigurationManager
  private readonly projectSpaces: Ref<ProjectSpaceResource[]>

  constructor(
    store: Store<any>,
    router: Router,
    clientService: ClientService,
    configurationManager: ConfigurationManager
  ) {
    this.component = PreviewComponent
    this.router = router
    this.store = store
    // define how long the cache should be valid, maybe conf option?
    this.cache = new Cache({ ttl: 10000, capacity: 100 })
    this.clientService = clientService
    this.configurationManager = configurationManager
    this.projectSpaces = computed(() =>
      this.store.getters['runtime/spaces/spaces'].filter((s) => isProjectSpaceResource(s))
    )
  }

  getProjectSpace(id): ProjectSpaceResource {
    return unref(this.projectSpaces).find((s) => s.id === id)
  }

  public async search(term: string): Promise<SearchResult> {
    if (!term) {
      return {
        totalResults: null,
        values: []
      }
    }

    if (this.configurationManager.options.routing.fullShareOwnerPaths) {
      await this.store.dispatch('runtime/spaces/loadMountPoints', {
        graphClient: this.clientService.graphAuthenticated
      })
    }

    if (this.cache.has(term)) {
      return this.cache.get(term)
    }

    const areHiddenFilesShown = this.store.state.Files?.areHiddenFilesShown

    const { resources, totalResults } = await this.clientService.webdav.search(term, {
      searchLimit: previewSearchLimit,
      davProperties: DavProperties.Default
    })

    return {
      totalResults,
      values: resources
        .map((resource) => {
          const matchingSpace = this.getProjectSpace(resource.parentFolderId)
          const data = matchingSpace ? matchingSpace : resource

          // info: in oc10 we have no storageId in resources. All resources are mounted into the personal space.
          if (!data.storageId) {
            data.storageId = this.store.getters.user.id
          }
          if (this.configurationManager.options.routing.fullShareOwnerPaths && data.shareRoot) {
            data.path = urlJoin(data.shareRoot, data.path)
          }

          return { id: data.id, data }
        })
        .filter(({ data }) => {
          // filter results if hidden files shouldn't be shown due to settings
          return !data.name.startsWith('.') || areHiddenFilesShown
        })
    }
  }

  public get available(): boolean {
    return unref(this.router.currentRoute).name !== 'search-provider-list'
  }
}
