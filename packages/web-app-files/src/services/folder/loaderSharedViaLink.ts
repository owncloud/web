import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationSharesActive } from '../../router'
import { aggregateResourceShares } from '../../helpers/resources'
import { useCapabilityFilesSharingResharing } from 'web-pkg/src/composables'
import { unref } from '@vue/composition-api'

export class FolderLoaderSharedViaLink implements FolderLoader {
  public isEnabled(router: Router): boolean {
    return isLocationSharesActive(router, 'files-shares-via-link')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const {
      store,
      clientService: { owncloudSdk: client }
    } = context

    const hasResharing = useCapabilityFilesSharingResharing(store)

    return useTask(function* (signal1, signal2) {
      store.commit('Files/CLEAR_CURRENT_FILES_LIST')

      let resources = yield client.requests.ocs({
        service: 'apps/files_sharing',
        action: '/api/v1/shares?format=json&share_types=3&include_tags=false',
        method: 'GET'
      })

      resources = yield resources.json()
      resources = resources.ocs.data

      if (resources.length) {
        const configuration = store.getters.configuration
        const getToken = store.getters.getToken

        resources = aggregateResourceShares(
          resources,
          false,
          unref(hasResharing),
          configuration.server,
          getToken
        )
      }

      store.commit('Files/LOAD_FILES', {
        currentFolder: null,
        files: resources
      })
    })
  }
}
