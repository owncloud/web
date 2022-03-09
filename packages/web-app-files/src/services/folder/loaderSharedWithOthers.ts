import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationSharesActive } from '../../router'
import { aggregateResourceShares } from '../../helpers/resources'

export class FolderLoaderSharedWithOthers implements FolderLoader {
  public isEnabled(router: Router): boolean {
    return isLocationSharesActive(router, 'files-shares-with-others')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    return useTask(function* (signal1, signal2, ref) {
      ref.CLEAR_CURRENT_FILES_LIST()

      let resources = yield ref.$client.requests.ocs({
        service: 'apps/files_sharing',
        action: '/api/v1/shares?format=json&reshares=true&include_tags=false',
        method: 'GET'
      })

      resources = yield resources.json()
      resources = resources.ocs.data

      if (resources.length) {
        resources = aggregateResourceShares(
          resources,
          false,
          !ref.isOcis,
          ref.configuration.server,
          ref.getToken
        )
      }

      ref.LOAD_FILES({ currentFolder: null, files: resources })
    })
  }
}
