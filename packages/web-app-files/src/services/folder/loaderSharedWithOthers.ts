import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import { Router } from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationSharesActive } from '@ownclouders/web-pkg'
import { aggregateResourceShares } from '@ownclouders/web-client/src/helpers/share'
import { peopleRoleDenyFolder, ShareTypes } from '@ownclouders/web-client/src/helpers/share'

export class FolderLoaderSharedWithOthers implements FolderLoader {
  public isEnabled(): boolean {
    return true
  }

  public isActive(router: Router): boolean {
    return isLocationSharesActive(router, 'files-shares-with-others')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const { userStore, spacesStore, clientService, configStore, capabilityStore, resourcesStore } =
      context
    const { owncloudSdk: client } = clientService

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return useTask(function* (signal1, signal2) {
      resourcesStore.clearResourceList()
      resourcesStore.setAncestorMetaData({})

      if (configStore.options.routing.fullShareOwnerPaths) {
        yield spacesStore.loadMountPoints({ graphClient: clientService.graphAuthenticated })
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
          spaces: spacesStore.spaces,
          incomingShares: false,
          allowSharePermission: capabilityStore.sharingResharing,
          hasShareJail: capabilityStore.spacesShareJail,
          fullShareOwnerPaths: configStore.options.routing.fullShareOwnerPaths
        }).map((resource) => {
          // info: in oc10 we have no storageId in resources. All resources are mounted into the personal space.
          if (!resource.storageId) {
            resource.storageId = userStore.user.onPremisesSamAccountName
          }
          return resource
        })
      }

      resourcesStore.initResourceList({ currentFolder: null, resources })
    })
  }
}
