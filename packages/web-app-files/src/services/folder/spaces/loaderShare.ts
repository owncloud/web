import { FolderLoader, FolderLoaderTask, TaskContext } from '../../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationSpacesActive } from '../../../router'
import { buildResource, buildWebDavSpacesPath } from '../../../helpers/resources'
import { Store } from 'vuex'
import get from 'lodash-es/get'

const SHARE_JAIL_ID = 'a0ca6a90-a365-4782-871e-d44447bbc668'

export class FolderLoaderSpacesShare implements FolderLoader {
  public isEnabled(store: Store<any>): boolean {
    return get(store, 'getters.capabilities.spaces', false)
  }

  public isActive(router: Router): boolean {
    return isLocationSpacesActive(router, 'files-spaces-share')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const { store, clientService } = context

    return useTask(function* (signal1, signal2, ref, shareId, path = null) {
      store.commit('Files/CLEAR_CURRENT_FILES_LIST')

      const webDavResponse = yield clientService.owncloudSdk.files.list(
        buildWebDavSpacesPath([SHARE_JAIL_ID, shareId].join('!'), path || '')
      )

      const resources = webDavResponse.map(buildResource)
      const currentFolder = resources.shift()

      store.commit('Files/LOAD_FILES', {
        currentFolder,
        files: resources
      })
    })
  }
}
