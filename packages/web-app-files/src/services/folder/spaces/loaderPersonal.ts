import { FolderLoader, FolderLoaderTask, TaskContext } from '../../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { DavProperties } from 'web-pkg/src/constants'
import { buildResource, buildWebDavSpacesPath } from '../../../helpers/resources'
import { isLocationSpacesActive } from '../../../router'
import { Store } from 'vuex'
import { fetchResources } from '../util'
import get from 'lodash-es/get'
import { Polling } from '../../../constants'

export class FolderLoaderSpacesPersonal implements FolderLoader {
  public isEnabled(store: Store<any>): boolean {
    return get(store, 'getters.capabilities.spaces.share_jail', false)
  }

  public isActive(router: Router): boolean {
    return isLocationSpacesActive(router, 'files-spaces-personal')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const { store, clientService } = context
    const resourcePollingDelay = Polling.ProcessingDelay
    const resourcePollingDelayIncreaseFactor = Polling.ProcessingDelayIncreaseFactor
    const resourcePollingTask = useTask(function* (signal, path, delay = 0) {
      const { store, router, clientService } = context
      yield new Promise((resolve) => setTimeout(resolve, delay))

      let resources = yield fetchResources(
        clientService.owncloudSdk,
        buildWebDavSpacesPath(
          router.currentRoute.params.storageId,
          path || router.currentRoute.params.item || ''
        ),
        DavProperties.Default
      )

      resources = resources.map(buildResource)

      const hasProcessingResources = resources.some(({ processing }) => processing)

      if (hasProcessingResources) {
        resourcePollingTask.perform(
          path,
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

      store.commit('Files/LOAD_FILES', {
        currentFolder,
        files: resources,
        loadIndicators: true
      })
    })

    return useTask(function* (signal1, signal2, ref, sameRoute, path = null) {
      try {
        store.commit('Files/CLEAR_CURRENT_FILES_LIST')

        yield resourcePollingTask.perform(path)

        // fetch user quota
        ;(async () => {
          const user = await clientService.owncloudSdk.users.getUser(ref.user.id)
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
