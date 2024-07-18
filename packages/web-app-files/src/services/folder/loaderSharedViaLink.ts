import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import { Router } from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationSharesActive } from '@ownclouders/web-pkg'
import { buildOutgoingShareResource, call } from '@ownclouders/web-client'

export class FolderLoaderSharedViaLink implements FolderLoader {
  public isEnabled(): boolean {
    return true
  }

  public isActive(router: Router): boolean {
    return isLocationSharesActive(router, 'files-shares-via-link')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const { userStore, spacesStore, clientService, configStore, resourcesStore } = context

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return useTask(function* (signal1, signal2) {
      resourcesStore.clearResourceList()
      resourcesStore.setAncestorMetaData({})

      if (configStore.options.routing.fullShareOwnerPaths) {
        yield spacesStore.loadMountPoints({ graphClient: clientService.graphAuthenticated })
      }

      const value = yield* call(clientService.graphAuthenticated.driveItems.listSharedByMe())

      const resources = value
        .filter((s) => s.permissions.some(({ link }) => !!link))
        .map((driveItem) => buildOutgoingShareResource({ driveItem, user: userStore.user }))

      resourcesStore.initResourceList({ currentFolder: null, resources })
    })
  }
}
