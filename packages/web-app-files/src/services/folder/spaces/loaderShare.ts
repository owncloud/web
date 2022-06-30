import { FolderLoader, FolderLoaderTask, TaskContext } from '../../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationSpacesActive } from '../../../router'
import { buildResource, buildWebDavSpacesPath } from '../../../helpers/resources'
import { Store } from 'vuex'
import get from 'lodash-es/get'
import { Polling } from '../../../constants'

export const SHARE_JAIL_ID = 'a0ca6a90-a365-4782-871e-d44447bbc668'

export class FolderLoaderSpacesShare implements FolderLoader {
  public isEnabled(store: Store<any>): boolean {
    return get(store, 'getters.capabilities.spaces.share_jail', false)
  }

  public isActive(router: Router): boolean {
    return isLocationSpacesActive(router, 'files-spaces-share')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const { store, router, clientService } = context
    const resourcePollingDelay = Polling.ProcessingDelay
    const resourcePollingDelayIncreaseFactor = Polling.ProcessingDelayIncreaseFactor
    const resourcePollingTask = useTask(function* (signal, shareId, path, delay = 0) {
      yield new Promise((resolve) => setTimeout(resolve, delay))

      const webDavResponse = yield clientService.owncloudSdk.files.list(
        buildWebDavSpacesPath(
          [SHARE_JAIL_ID, shareId].join('!'),
          path || router.currentRoute.params.item || ''
        )
      )

      const resources = webDavResponse.map(buildResource)
      const hasProcessingResources = resources.some(({ processing }) => processing)

      if (hasProcessingResources) {
        resourcePollingTask.perform(
          shareId,
          path,
          delay * resourcePollingDelayIncreaseFactor || resourcePollingDelay
        )
      }

      if (hasProcessingResources && delay) {
        return
      }

      const currentFolder = resources.shift()

      store.commit('Files/LOAD_FILES', {
        currentFolder,
        files: resources
      })
    })

    return useTask(function* (signal1, signal2, ref, shareId, path = null) {
      store.commit('Files/CLEAR_CURRENT_FILES_LIST')
      yield resourcePollingTask.perform(shareId, path)
    })
  }
}
