import { FolderLoader, FolderLoaderTask, TaskContext } from '../../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationSpacesActive } from '../../../router'
import { buildResource } from '../../../helpers/resources'
import { DavProperties } from 'web-pkg/src/constants'
import { Store } from 'vuex'
import get from 'lodash-es/get'
import { useCapabilityShareJailEnabled } from 'web-pkg/src/composables'
import { getIndicators } from '../../../helpers/statusIndicators'
import { buildWebDavSpacesPath } from 'web-client/src/helpers'
import { fetchResources } from '../util'

export class FolderLoaderSpacesGeneric implements FolderLoader {
  public isEnabled(store: Store<any>): boolean {
    return get(store, 'getters.capabilities.spaces.enabled', false)
  }

  public isActive(router: Router): boolean {
    return isLocationSpacesActive(router, 'files-spaces-generic')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const { store, router, clientService } = context

    return useTask(function* (signal1, signal2, ref, sameRoute, path = null) {
      try {
        store.commit('Files/CLEAR_CURRENT_FILES_LIST')

        const webDavResources = yield fetchResources(
          clientService.owncloudSdk,
          buildWebDavSpacesPath(ref.space.fileId, path || router.currentRoute.params.item || ''),
          DavProperties.Default
        )

        let resources: any[]
        if (!path) {
          resources = [ref.space, ...webDavResources.slice(1).map(buildResource)]
        } else {
          resources = resources.map(buildResource)
        }

        const currentFolder = resources.shift()
        const hasShareJail = useCapabilityShareJailEnabled(store)
        yield store.dispatch('Files/loadSharesTree', {
          client: clientService.owncloudSdk,
          path: currentFolder.path,
          storageId: ref.space.fileId
        })

        for (const file of resources) {
          file.indicators = getIndicators(file, store.state.Files.sharesTree, hasShareJail.value)
        }

        store.commit('Files/LOAD_FILES', {
          currentFolder,
          files: resources
        })
      } catch (error) {
        store.commit('Files/SET_CURRENT_FOLDER', null)
        console.error(error)
      }

      // FIXME: should not be part of the loader
      ref.refreshFileListHeaderPosition()
      ref.accessibleBreadcrumb_focusAndAnnounceBreadcrumb(sameRoute)
    }).restartable()
  }
}
