import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import { Router } from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationSharesActive } from 'web-pkg/src/router'
import { ShareTypes } from 'web-client/src/helpers/share'
import { aggregateResourceShares } from 'web-client/src/helpers/share'
import { Store } from 'vuex'
import {
  useCapabilityFilesSharingResharing,
  useCapabilityShareJailEnabled
} from 'web-pkg/src/composables'
import { unref } from 'vue'

export class FolderLoaderSharedViaLink implements FolderLoader {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public isEnabled(store: Store<any>): boolean {
    return true
  }

  public isActive(router: Router): boolean {
    return isLocationSharesActive(router, 'files-shares-via-link')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const { store, clientService, configurationManager } = context
    const { owncloudSdk: client } = clientService

    const hasResharing = useCapabilityFilesSharingResharing(store)
    const hasShareJail = useCapabilityShareJailEnabled(store)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return useTask(function* (signal1, signal2) {
      store.commit('Files/CLEAR_CURRENT_FILES_LIST')
      store.commit('runtime/ancestorMetaData/SET_ANCESTOR_META_DATA', {})

      if (configurationManager.options.routing.fullShareOwnerPaths) {
        yield store.dispatch('runtime/spaces/loadMountPoints', {
          graphClient: clientService.graphAuthenticated
        })
      }

      let resources = yield client.shares.getShares('', {
        share_types: ShareTypes.link.value.toString(),
        include_tags: false
      })

      resources = resources.map((r) => r.shareInfo)
      const spaces = store.getters['runtime/spaces/spaces']
      if (resources.length) {
        resources = aggregateResourceShares(
          resources,
          false,
          unref(hasResharing),
          unref(hasShareJail),
          spaces
        ).map((resource) => {
          // info: in oc10 we have no storageId in resources. All resources are mounted into the personal space.
          if (!resource.storageId) {
            resource.storageId = store.getters.user.id
          }
          return resource
        })
      }

      store.commit('Files/LOAD_FILES', {
        currentFolder: null,
        files: resources
      })
    })
  }
}
