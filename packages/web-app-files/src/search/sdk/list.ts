import ListComponent from '../../components/Search/List.vue'
import { ClientService, SearchList, SearchResult } from '@ownclouders/web-pkg'
import { ProjectSpaceResource, isProjectSpaceResource } from '@ownclouders/web-client/src/helpers'
import { Component, computed, Ref, unref } from 'vue'
import { DavProperties } from '@ownclouders/web-client/src/webdav/constants'
import { Store } from 'vuex'
import { ConfigurationManager } from '@ownclouders/web-pkg'
import { urlJoin } from '@ownclouders/web-client/src/utils'

export const searchLimit = 200

export default class List implements SearchList {
  public readonly component: Component
  private readonly store: Store<any>
  private readonly clientService: ClientService
  private readonly configurationManager: ConfigurationManager
  private readonly projectSpaces: Ref<ProjectSpaceResource[]>

  constructor(
    store: Store<any>,
    clientService: ClientService,
    configurationManager: ConfigurationManager
  ) {
    this.component = ListComponent
    this.store = store
    this.clientService = clientService
    this.configurationManager = configurationManager
    this.projectSpaces = computed(() =>
      this.store.getters['runtime/spaces/spaces'].filter((s) => isProjectSpaceResource(s))
    )
  }

  getProjectSpace(id): ProjectSpaceResource {
    return unref(this.projectSpaces).find((s) => s.id === id)
  }

  async search(term: string): Promise<SearchResult> {
    if (this.configurationManager.options.routing.fullShareOwnerPaths) {
      await this.store.dispatch('runtime/spaces/loadMountPoints', {
        graphClient: this.clientService.graphAuthenticated
      })
    }

    if (!term) {
      return {
        totalResults: null,
        values: []
      }
    }

    const { resources, totalResults } = await this.clientService.webdav.search(term, {
      searchLimit,
      davProperties: DavProperties.Default
    })

    return {
      totalResults,
      values: resources.map((resource) => {
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
    }
  }
}
