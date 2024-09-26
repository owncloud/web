import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import { Router } from 'vue-router'
import { useTask } from 'vue-concurrency'
import { buildResource } from '@ownclouders/web-client'
import { isLocationCommonActive } from '@ownclouders/web-pkg'

export class FolderLoaderFavorites implements FolderLoader {
  public isEnabled(): boolean {
    return true
  }

  public isActive(router: Router): boolean {
    return isLocationCommonActive(router, 'files-common-favorites')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const { resourcesStore, clientService, userStore } = context

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return useTask(function* (signal1, signal2) {
      resourcesStore.clearResourceList()
      resourcesStore.setAncestorMetaData({})

      let resources = yield clientService.webdav.listFavoriteFiles({
        username: userStore.user?.onPremisesSamAccountName,
        signal: signal1
      })

      resources = resources.map(buildResource)
      resourcesStore.initResourceList({ currentFolder: null, resources })
    })
  }
}
