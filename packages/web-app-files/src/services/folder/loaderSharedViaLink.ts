import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import { Router } from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationSharesActive } from '@ownclouders/web-pkg'
import { ShareTypes } from '@ownclouders/web-client/src/helpers/share'
import { aggregateResourceShares } from '@ownclouders/web-client/src/helpers/share'
import { Store } from 'vuex'

export class FolderLoaderSharedViaLink implements FolderLoader {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public isEnabled(store: Store<any>): boolean {
    return true
  }

  public isActive(router: Router): boolean {
    return isLocationSharesActive(router, 'files-shares-via-link')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const { store, userStore, spacesStore, clientService, configurationManager, capabilityStore } =
      context
    const { owncloudSdk: client } = clientService

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return useTask(function* (signal1, signal2) {
      store.commit('Files/CLEAR_CURRENT_FILES_LIST')
      store.commit('runtime/ancestorMetaData/SET_ANCESTOR_META_DATA', {})

      if (configurationManager.options.routing.fullShareOwnerPaths) {
        yield spacesStore.loadMountPoints({ graphClient: clientService.graphAuthenticated })
      }

      let resources = yield client.shares.getShares('', {
        share_types: ShareTypes.link.value.toString(),
        include_tags: false
      })

      resources = resources.map((r) => r.shareInfo)
      if (resources.length) {
        resources = aggregateResourceShares({
          shares: resources,
          spaces: spacesStore.spaces,
          incomingShares: false,
          allowSharePermission: capabilityStore.sharingResharing,
          hasShareJail: capabilityStore.spacesShareJail,
          fullShareOwnerPaths: configurationManager.options.routing.fullShareOwnerPaths
        }).map((resource) => {
          // info: in oc10 we have no storageId in resources. All resources are mounted into the personal space.
          if (!resource.storageId) {
            resource.storageId = userStore.user.onPremisesSamAccountName
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
