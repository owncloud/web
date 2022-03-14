import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { DavProperties } from 'web-pkg/src/constants'
import { buildResource } from '../../helpers/resources'
import { isLocationCommonActive } from '../../router'

export class FolderLoaderFavorites implements FolderLoader {
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

      let resources = yield client.files.getFavoriteFiles(DavProperties.Default)
      resources = resources.map(buildResource)
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
