import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationPublicActive } from '../../router'

import { Store } from 'vuex'
import { authService } from 'web-runtime/src/services/auth'
import { SpaceResource } from 'web-client/src/helpers'

export class FolderLoaderPublicFiles implements FolderLoader {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public isEnabled(store: Store<any>): boolean {
    return true
  }

  public isActive(router: Router): boolean {
    return isLocationPublicActive(router, 'files-public-files')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const {
      store,
      router,
      clientService: { webdav }
    } = context

    return useTask(function* (signal1, signal2, space: SpaceResource, path: string = null) {
      store.commit('Files/CLEAR_CURRENT_FILES_LIST')

      try {
        const resources = yield webdav.listFiles(space, { path })
        store.commit('Files/LOAD_FILES', {
          currentFolder: resources[0],
          files: resources.slice(1)
        })
      } catch (error) {
        store.commit('Files/SET_CURRENT_FOLDER', null)
        console.error(error)

        if (error.statusCode === 401) {
          return authService.handleAuthError(router.currentRoute)
        }
      }
    })
  }
}
