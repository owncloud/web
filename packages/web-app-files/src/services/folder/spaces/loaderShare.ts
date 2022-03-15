import { FolderLoader, FolderLoaderTask, TaskContext } from '../../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationSpacesActive } from '../../../router'
import { buildResource, buildWebDavSpacesPath } from '../../../helpers/resources'
import { Store } from 'vuex'
import get from 'lodash-es/get'

export class FolderLoaderSpacesShare implements FolderLoader {
  public isEnabled(store: Store<any>): boolean {
    return get(store, 'getters.capabilities.spaces', false)
  }

  public isActive(router: Router): boolean {
    return isLocationSpacesActive(router, 'files-spaces-share')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const router = context.router
    const store = context.store
    const clientService = context.clientService

    const graphClient = clientService.graphAuthenticated(
      store.getters.configuration.server,
      store.getters.getToken
    )

    return useTask(function* (signal1, signal2, ref, storageId, path = null) {
      ref.CLEAR_CURRENT_FILES_LIST()
      console.log('wololo')
      const graphResponse = yield graphClient.drives.listMyDrives('', 'driveType eq mountpoint')
      console.log('mountpoints', graphResponse.data)
      if (!graphResponse.data) {
        return
      }

      const webDavResponse = yield ref.$client.files.list(
        buildWebDavSpacesPath(storageId, path || '')
      )

      let resources = []
      if (!path) {
        // space front page -> use space as current folder
        resources.push(ref.space)

        const webDavResources = webDavResponse.map(buildResource)
        webDavResources.shift() // Remove webdav entry for the space itself
        resources = resources.concat(webDavResources)
      } else {
        resources = webDavResponse.map(buildResource)
      }

      const currentFolder = resources.shift()

      ref.LOAD_FILES({
        currentFolder,
        files: resources
      })
    })
  }
}
