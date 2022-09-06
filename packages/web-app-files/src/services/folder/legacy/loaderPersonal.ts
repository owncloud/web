import { FolderLoader, FolderLoaderTask, TaskContext } from '../../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { DavProperties } from 'web-pkg/src/constants'
import { buildResource, buildWebDavFilesPath } from '../../../helpers/resources'
import { isLocationSpacesActive } from '../../../router'
import { Store } from 'vuex'
import { fetchResources } from '../util'
import get from 'lodash-es/get'
import { Resource } from 'web-client'
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

    const getResourcesAndCurrent = async (
      resourcePromise: Promise<any>
    ): Promise<[Resource[], Resource]> => {
      let resources = await resourcePromise
      resources = resources.map(buildResource)
      const currentFolder = resources.shift()
      return [resources, currentFolder]
    }

    return useTask(function* (signal1, signal2, ref, sameRoute, path = null) {
      try {
        store.commit('Files/CLEAR_CURRENT_FILES_LIST')

        const resourcesPromise = fetchResources(
          client,
          buildWebDavFilesPath(
            router.currentRoute.params.storageId,
            path || router.currentRoute.params.item || ''
          ),
          DavProperties.Default
        )

        let currentPath =
          path || router.currentRoute.params.item ? `/${router.currentRoute.params.item}` : null
        let resources, currentFolder

        if (!currentPath) {
          [resources, currentFolder] = yield getResourcesAndCurrent(resourcesPromise)
          currentPath = currentFolder.path
        }

        const hasShareJail = useCapabilityShareJailEnabled(store)
        yield store.dispatch('Files/loadSharesTree', {
          client,
          path: currentPath
        })

        if (!resources) {
          [resources, currentFolder] = yield getResourcesAndCurrent(resourcesPromise)
        }

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

      ref.refreshFileListHeaderPosition()

      ref.accessibleBreadcrumb_focusAndAnnounceBreadcrumb(sameRoute)
    }).restartable()
  }
}
