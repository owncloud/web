import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import { Router } from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationSharesActive } from '@ownclouders/web-pkg/src/router'
import { aggregateResourceShares } from 'web-client/src/helpers/share'
import { Store } from 'vuex'
import { peopleRoleDenyFolder, ShareTypes } from 'web-client/src/helpers/share'
import {
  useCapabilityFilesSharingResharing,
  useCapabilityShareJailEnabled
} from '@ownclouders/web-pkg'
import { unref } from 'vue'

export class FolderLoaderSharedWithOthers implements FolderLoader {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public isEnabled(store: Store<any>): boolean {
    return true
  }

  public isActive(router: Router): boolean {
    return isLocationSharesActive(router, 'files-shares-with-others')
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

      const shareTypes = ShareTypes.authenticated
        .filter(
          (type) => ![ShareTypes.spaceUser.value, ShareTypes.spaceGroup.value].includes(type.value)
        )
        .map((share) => share.value)
        .join(',')

      let resources = yield client.shares.getShares('', {
        share_types: shareTypes,
        reshares: true,
        include_tags: false
      })
      resources = resources
        .filter((r) => parseInt(r.shareInfo.permissions) !== peopleRoleDenyFolder.bitmask(false))
        .map((r) => r.shareInfo)
      if (resources.length) {
        resources = aggregateResourceShares({
          shares: resources,
          spaces: store.getters['runtime/spaces/spaces'],
          incomingShares: false,
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

      store.commit('Files/LOAD_FILES', { currentFolder: null, files: resources })
    })
  }
}
