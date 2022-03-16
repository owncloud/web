import { FolderLoader, FolderLoaderTask, TaskContext } from '../../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationSpacesActive } from '../../../router'
import { buildResource, buildWebDavSpacesPath } from '../../../helpers/resources'
import { Store } from 'vuex'
import get from 'lodash-es/get'

export class FolderLoaderSpacesShare implements FolderLoader {
  public isEnabled(store: Store<any>): boolean {
    return get(store, 'getters.capabilities.spaces', false)
  }

  public isActive(router: Router): boolean {
    return isLocationSpacesActive(router, 'files-spaces-share')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const {
      store,
      clientService: { owncloudSdk: client }
    } = context

    return useTask(function* (signal1, signal2, ref, storageId, path = null) {
      store.commit('Files/CLEAR_CURRENT_FILES_LIST')

      const webDavResponse = yield client.files.list(buildWebDavSpacesPath(storageId, path || ''))

      const resources = webDavResponse.map(buildResource)
      const currentFolder = resources.shift()

      store.commit('Files/LOAD_FILES', {
        currentFolder,
        files: resources
      })
    })
  }
}
