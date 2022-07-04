import { FolderLoader, FolderLoaderTask, TaskContext } from '../../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { DavProperties } from 'web-pkg/src/constants'
import { buildResource, buildWebDavFilesPath } from '../../../helpers/resources'
import { isLocationSpacesActive } from '../../../router'
import { Store } from 'vuex'
import { fetchResources } from '../util'
import get from 'lodash-es/get'
import { useCapabilityShareJailEnabled } from 'web-pkg/src/composables'
import { getIndicators } from '../../../helpers/statusIndicators'

export class FolderLoaderLegacyPersonal implements FolderLoader {
  public isEnabled(store: Store<any>): boolean {
    return !get(store, 'getters.capabilities.spaces.share_jail', false)
  }

  public isActive(router: Router): boolean {
    return isLocationSpacesActive(router, 'files-spaces-personal')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const {
      store,
      router,
      clientService: { owncloudSdk: client }
    } = context

    return useTask(function* (signal1, signal2, ref, sameRoute, path = null) {
      try {
        store.commit('Files/CLEAR_CURRENT_FILES_LIST')

        let resources = yield fetchResources(
          client,
          buildWebDavFilesPath(
            router.currentRoute.params.storageId,
            path || router.currentRoute.params.item || ''
          ),
          DavProperties.Default
        )
        resources = resources.map(buildResource)

        const currentFolder = resources.shift()
        const hasShareJail = useCapabilityShareJailEnabled(store)
        yield store.dispatch('Files/loadSharesTree', {
          client,
          path: currentFolder.path
        })

        for (const file of resources) {
          file.indicators = getIndicators(file, store.state.Files.sharesTree, hasShareJail.value)
        }

        store.commit('Files/LOAD_FILES', {
          currentFolder,
          files: resources
        })

        // fetch user quota
        ;(async () => {
          const user = await client.users.getUser(store.getters.user.id)
          store.commit('SET_QUOTA', user.quota)
        })()
      } catch (error) {
        store.commit('Files/SET_CURRENT_FOLDER', null)
        console.error(error)
      }

      ref.refreshFileListHeaderPosition()

      ref.accessibleBreadcrumb_focusAndAnnounceBreadcrumb(sameRoute)
      ref.scrollToResourceFromRoute()
    }).restartable()
  }
}
