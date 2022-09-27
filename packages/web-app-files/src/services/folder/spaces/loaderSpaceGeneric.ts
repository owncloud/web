import { FolderLoader, FolderLoaderTask, TaskContext } from '../../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationSpacesActive } from '../../../router'
import { Store } from 'vuex'
import get from 'lodash-es/get'
import { useCapabilityShareJailEnabled, useRouteParam } from 'web-pkg/src/composables'
import { getIndicators } from '../../../helpers/statusIndicators'
import { SpaceResource } from 'web-client/src/helpers'
import { unref } from '@vue/composition-api'

export class FolderLoaderSpacesGeneric implements FolderLoader {
  public isEnabled(store: Store<any>): boolean {
    return get(store, 'getters.capabilities.spaces.enabled', false)
  }

  public isActive(router: Router): boolean {
    // TODO: remove next check when isLocationSpacesActive doesn't return true for generic route when being on projects overview.
    if (isLocationSpacesActive(router, 'files-spaces-projects')) {
      return false
    }
    if (!isLocationSpacesActive(router, 'files-spaces-generic')) {
      return false
    }
    const driveAliasAndItem = useRouteParam('driveAliasAndItem')
    return !unref(driveAliasAndItem).startsWith('share/')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const {
      store,
      clientService: { owncloudSdk: client, webdav }
    } = context
    const hasShareJail = useCapabilityShareJailEnabled(store)

    return useTask(function* (signal1, signal2, space: SpaceResource, path: string = null) {
      try {
        store.commit('Files/CLEAR_CURRENT_FILES_LIST')

        const resources = yield webdav.listFiles(space, { path })
        let currentFolder = resources.shift()
        // FIXME / technical debt: at some point we want to use the space as current folder for all drive types. but somehow broken for personal spaces...
        if (path === '/' && space.driveType !== 'personal') {
          currentFolder = space
        }

        yield store.dispatch('Files/loadSharesTree', {
          client,
          path: currentFolder.path,
          storageId: currentFolder.fileId
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
