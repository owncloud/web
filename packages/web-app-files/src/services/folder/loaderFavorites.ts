import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { DavProperties } from 'web-pkg/src/constants'
import { buildResource } from '../../helpers/resources'
import { isLocationCommonActive } from '../../router'

export class FolderLoaderFavorites implements FolderLoader {
  public isEnabled(router: Router): boolean {
    return isLocationCommonActive(router, 'files-common-favorites')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    return useTask(function* (signal1, signal2, ref) {
      ref.CLEAR_CURRENT_FILES_LIST()

      let resources = yield ref.$client.files.getFavoriteFiles(DavProperties.Default)
      resources = resources.map(buildResource)
      ref.LOAD_FILES({ currentFolder: null, files: resources })
      ref.loadIndicators({ client: this.$client, currentFolder: '/' })
    })
  }
}
