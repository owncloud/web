import { FolderLoader, FolderLoaderTask, TaskContext } from '../../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationSpacesActive } from '../../../router'
import { clientService } from 'web-pkg/src/services'
import { buildResource, buildSpace, buildWebDavSpacesPath } from '../../../helpers/resources'
import { Store } from 'vuex'
import get from 'lodash-es/get'
import { DavProperties } from 'web-pkg/src/constants'
import { Polling } from '../../../constants'

export class FolderLoaderSpacesProject implements FolderLoader {
  public isEnabled(store: Store<any>): boolean {
    return get(store, 'getters.capabilities.spaces.projects', false)
  }

  public isActive(router: Router): boolean {
    return isLocationSpacesActive(router, 'files-spaces-project')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const router = context.router
    const store = context.store
    const resourcePollingDelay = Polling.ProcessingDelay
    const resourcePollingDelayIncreaseFactor = Polling.ProcessingDelayIncreaseFactor
    const resourcePollingTask = useTask(function* (signal, ref, path, space, delay = 0) {
      yield new Promise((resolve) => setTimeout(resolve, delay))

      const webDavResponse = yield ref.$client.files.list(
        buildWebDavSpacesPath(
          ref.$route.params.storageId,
          path || router.currentRoute.params.item || ''
        ),
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

      const hasProcessingResources = resources.some(({ processing }) => processing)

      if (hasProcessingResources) {
        resourcePollingTask.perform(
          ref,
          path,
          space,
          delay * resourcePollingDelayIncreaseFactor || resourcePollingDelay
        )
      }

      if (hasProcessingResources && delay) {
        return
      }

      const currentFolder = resources.shift()
      yield store.dispatch('Files/loadSharesTree', {
        client: clientService.owncloudSdk,
        path: currentFolder.path
      })

      ref.LOAD_FILES({
        currentFolder,
        files: resources,
        loadIndicators: true
      })
    })

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

      yield resourcePollingTask.perform(ref, path, space)

      ref.UPSERT_SPACE(space)

      if (!sameRoute) {
        ref.space = space
      }
    })
  }
}
