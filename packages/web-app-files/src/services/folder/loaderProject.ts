import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationSpacesActive } from '../../router'
import { clientService } from 'web-pkg/src/services'
import { buildResource, buildSpace, buildWebDavSpacesPath } from '../../helpers/resources'
import { DavProperties } from 'web-pkg/src/constants'

export class FolderLoaderProject implements FolderLoader {
  public isActive(router: Router): boolean {
    return isLocationSpacesActive(router, 'files-spaces-project')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const router = context.router
    const store = context.store

    return useTask(function* (signal1, signal2, ref, sameRoute, path = null) {
      ref.CLEAR_CURRENT_FILES_LIST()

      let space
      if (!sameRoute) {
        const graphClient = clientService.graphAuthenticated(
          store.getters.configuration.server,
          store.getters.getToken
        )

        const storageId = router.currentRoute.params.storageId
        const graphResponse = yield graphClient.drives.getDrive(storageId)

        if (!graphResponse.data) {
          return
        }

        space = buildSpace(graphResponse.data)
      } else {
        space = ref.space
      }

      const webDavResponse = yield ref.$client.files.list(
        buildWebDavSpacesPath(ref.$route.params.storageId, path || ''),
        1,
        DavProperties.Default
      )

      let resources = []
      if (!path) {
        // space front page -> use space as current folder
        resources.push(space)

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
      ref.loadIndicators({
        client: ref.$client,
        currentFolder: currentFolder?.path,
        storageId: space.id
      })

      if (!sameRoute) {
        ref.space = space
      }
    })
  }
}
