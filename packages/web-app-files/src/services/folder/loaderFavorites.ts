import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import { Router } from 'vue-router'
import { useTask } from 'vue-concurrency'
import { DavProperties } from 'web-client/src/webdav/constants'
import { buildResource } from 'web-client/src/helpers'
import { isLocationCommonActive } from '../../router'

export class FolderLoaderFavorites implements FolderLoader {
  public isEnabled(): boolean {
    return true
  }

  public isActive(router: Router): boolean {
    return isLocationCommonActive(router, 'files-common-favorites')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const {
      store,
      clientService: { owncloudSdk: client }
    } = context

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return useTask(function* (signal1, signal2) {
      store.commit('Files/CLEAR_CURRENT_FILES_LIST')
      store.commit('Files/SET_ANCESTOR_META_DATA', {})

      let resources = yield client.files.getFavoriteFiles(DavProperties.Default)
      resources = resources.map((f) => {
        const resource = buildResource(f)
        // info: in oc10 we have no storageId in resources. All resources are mounted into the personal space.
        if (!resource.storageId) {
          resource.storageId = store.getters.user.id
        }
        return resource
      })
      store.commit('Files/LOAD_FILES', {
        currentFolder: null,
        files: resources
      })
      store.dispatch('Files/loadIndicators', {
        client: client,
        currentFolder: '/'
      })
    })
  }
}
