import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import { Router } from 'vue-router'
import { useTask } from 'vue-concurrency'
import { aggregateResourceShares } from 'web-client/src/helpers/share'
import { isLocationSharesActive } from '@ownclouders/web-pkg/src/router'
import { Store } from 'vuex'
import {
  useCapabilityFilesSharingResharing,
  useCapabilityShareJailEnabled
} from '@ownclouders/web-pkg'
import { unref } from 'vue'

export class FolderLoaderSharedWithMe implements FolderLoader {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public isEnabled(store: Store<any>): boolean {
    return true
  }

  public isActive(router: Router): boolean {
    return isLocationSharesActive(router, 'files-shares-with-me')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const { store, clientService, configurationManager } = context

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

      let resources = yield clientService.owncloudSdk.shares.getShares('', {
        state: 'all',
        include_tags: false,
        shared_with_me: true
      })

      resources = resources.map((r) => r.shareInfo)

      if (resources.length) {
        resources = aggregateResourceShares({
          shares: resources,
          spaces: store.getters['runtime/spaces/spaces'],
          incomingShares: true,
          allowSharePermission: unref(hasResharing),
          hasShareJail: unref(hasShareJail),
          fullShareOwnerPaths: configurationManager.options.routing.fullShareOwnerPaths
        }).map((resource) => {
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
