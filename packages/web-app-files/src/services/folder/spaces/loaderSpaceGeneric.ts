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
import { buildWebDavSpacesPath, Resource } from 'web-client/src/helpers'
import { fetchResources } from '../util'
import { unref } from '@vue/composition-api'

export class FolderLoaderSpacesGeneric implements FolderLoader {
  public isEnabled(store: Store<any>): boolean {
    return get(store, 'getters.capabilities.spaces.enabled', false)
  }

  public isActive(router: Router): boolean {
    // TODO: as soon as we can check for the generic space route being active we can remove the negative checks again.
    return (
      !isLocationSpacesActive(router, 'files-spaces-projects') &&
      !isLocationSpacesActive(router, 'files-spaces-share') &&
      isLocationSpacesActive(router, 'files-spaces-generic')
    )
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const { store, clientService } = context
    const hasShareJail = useCapabilityShareJailEnabled(store)

    return useTask(function* (signal1, signal2, space: Resource, path: string = null) {
      try {
        store.commit('Files/CLEAR_CURRENT_FILES_LIST')

        const webDavResources = yield fetchResources(
          clientService.owncloudSdk,
          buildWebDavSpacesPath(space.fileId, path || ''),
          DavProperties.Default
        )

        const resources = path
          ? webDavResources.map(buildResource)
          : [space, ...webDavResources.slice(1).map(buildResource)]
        const currentFolder = resources.shift()

        yield store.dispatch('Files/loadSharesTree', {
          client: clientService.owncloudSdk,
          path: currentFolder.path,
          storageId: space.fileId
        })

        for (const file of resources) {
          file.indicators = getIndicators(file, store.state.Files.sharesTree, unref(hasShareJail))
        }

        store.commit('Files/LOAD_FILES', {
          currentFolder,
          files: resources
        })
      } catch (error) {
        store.commit('Files/SET_CURRENT_FOLDER', null)
        console.error(error)
      }
    }).restartable()
  }
}
