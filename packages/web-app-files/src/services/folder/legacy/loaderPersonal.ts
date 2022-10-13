import { FolderLoader, FolderLoaderTask, TaskContext } from '../../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationSpacesActive } from '../../../router'
import { Store } from 'vuex'
import get from 'lodash-es/get'
import { getIndicators } from '../../../helpers/statusIndicators'
import { SpaceResource } from 'web-client/src/helpers'

export class FolderLoaderLegacyPersonal implements FolderLoader {
  public isEnabled(store: Store<any>): boolean {
    return !get(store, 'getters.capabilities.spaces.share_jail', false)
  }

  public isActive(router: Router): boolean {
    return isLocationSpacesActive(router, 'files-spaces-generic')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const {
      store,
      clientService: { owncloudSdk: client, webdav }
    } = context

    return useTask(function* (signal1, signal2, space: SpaceResource, path: string = null) {
      try {
        store.commit('Files/CLEAR_CURRENT_FILES_LIST')

        const resources = yield webdav.listFiles(space, { path })

        const currentFolder = resources.shift()
        yield store.dispatch('Files/loadSharesTree', {
          client,
          path: currentFolder.path
        })

        for (const file of resources) {
          file.indicators = getIndicators(file, store.state.Files.sharesTree, false)
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
