import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { aggregateResourceShares, buildWebDavSpacesPath } from '../../helpers/resources'
import { isLocationSharesActive } from '../../router'
import { Store } from 'vuex'
import get from 'lodash-es/get'
import { useCapabilityFilesSharingResharing } from 'web-pkg/src/composables'
import { unref } from '@vue/composition-api'
import { SHARE_JAIL_ID } from './spaces/loaderShare'

export class FolderLoaderSharedWithMe implements FolderLoader {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public isEnabled(store: Store<any>): boolean {
    return true
  }

  public isActive(router: Router): boolean {
    return isLocationSharesActive(router, 'files-shares-with-me')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const { store, clientService } = context

    const hasResharing = useCapabilityFilesSharingResharing(store)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return useTask(function* (signal1, signal2) {
      store.commit('Files/CLEAR_CURRENT_FILES_LIST')

      let resources = yield clientService.owncloudSdk.shares.getShares('', {
        state: 'all',
        include_tags: false,
        shared_with_me: true
      })

      resources = resources.map((r) => r.shareInfo)

      if (resources.length) {
        const configuration = store.getters.configuration
        const getToken = store.getters.getToken

        resources = aggregateResourceShares(
          resources,
          true,
          unref(hasResharing),
          configuration.server,
          getToken
        )

        // FIXME, HACK 1: path needs to be '/' because the share has it's own webdav endpoint (we access it's root). should ideally be removed backend side.
        // FIXME, HACK 2: webDavPath points to `files/<user>/Shares/xyz` but now needs to point to a shares webdav root. should ideally be changed backend side.
        if (get(store, 'getters.capabilities.spaces.share_jail', false)) {
          resources.forEach((resource) => {
            resource.path = '/'
            resource.webDavPath = buildWebDavSpacesPath([SHARE_JAIL_ID, resource.id].join('!'), '')
          })
        }
      }

      store.commit('Files/LOAD_FILES', {
        currentFolder: null,
        files: resources
      })
    })
  }
}
