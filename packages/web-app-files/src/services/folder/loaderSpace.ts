import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import { Router } from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationPublicActive, isLocationSpacesActive } from '../../router'
import { useCapabilityFilesSharingResharing } from 'web-pkg/src/composables'
import { SpaceResource, isMountPointSpaceResource } from 'web-client/src/helpers'
import { unref } from 'vue'
import { FolderLoaderOptions } from './types'
import { authService } from 'web-runtime/src/services/auth'
import { useFileRouteReplace } from 'web-pkg/src/composables/router/useFileRouteReplace'
import { aggregateResourceShares } from '../../helpers/resources'
import { getIndicators } from 'web-app-files/src/helpers/statusIndicators'
import { urlJoin } from 'web-client/src/utils'

export class FolderLoaderSpace implements FolderLoader {
  public isEnabled(): boolean {
    return true
  }

  public isActive(router: Router): boolean {
    // TODO: remove next check when isLocationSpacesActive doesn't return true for generic route when being on projects overview.
    if (isLocationSpacesActive(router, 'files-spaces-projects')) {
      return false
    }
    return (
      isLocationSpacesActive(router, 'files-spaces-generic') ||
      isLocationPublicActive(router, 'files-public-link')
    )
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const { store, router, clientService, configurationManager } = context
    const { owncloudSdk: client, webdav } = clientService
    const { replaceInvalidFileRoute } = useFileRouteReplace({ router })
    const hasResharing = useCapabilityFilesSharingResharing(store)

    return useTask(function* (
      signal1,
      signal2,
      space: SpaceResource,
      path: string = null,
      fileId: string | number = null,
      options: FolderLoaderOptions = {}
    ) {
      try {
        store.commit('Files/CLEAR_CURRENT_FILES_LIST')

        let { resource: currentFolder, children: resources } = yield webdav.listFiles(space, {
          fileId
        })

        const mountPoint = store.getters['runtime/spaces/spaces'].find(
          (s) => isMountPointSpaceResource(s) && path.startsWith(s.root.remoteItem.path)
        )
        if (mountPoint && !configurationManager.options.routing.fullShareOwnerPaths) {
          currentFolder.path = mountPoint.root.remoteItem.path
          const hiddenPath = currentFolder.path.split('/').slice(0, -1).join('/')
          currentFolder.visiblePath = currentFolder.path.replace(hiddenPath, '...')
          resources.forEach((r) => {
            r.path = urlJoin(path, r.path)
            r.visiblePath = r.path.replace(hiddenPath, '...')
          })
        } else {
          currentFolder.path = path
          resources.forEach((r) => {
            r.path = urlJoin(path, r.path)
          })
        }

        // if current folder has no id (= singe file public link) we must not correct the route
        if (currentFolder.id) {
          yield replaceInvalidFileRoute({ space, resource: currentFolder, path, fileId })
        }

        if (path === '/') {
          if (space.driveType === 'share') {
            const parentShare = yield client.shares.getShare(space.shareId)
            const aggregatedShares = aggregateResourceShares(
              [parentShare.shareInfo],
              true,
              unref(hasResharing),
              true
            )
            currentFolder = aggregatedShares[0]
          } else if (!['personal', 'public'].includes(space.driveType)) {
            // note: in the future we might want to show the space as root for personal spaces as well (to show quota and the like). Currently not needed.
            currentFolder = space
          }
        }

        if (options.loadShares) {
          const ancestorMetaData = store.getters['runtime/ancestorMetaData/ancestorMetaData']
          for (const file of resources) {
            file.indicators = getIndicators({ resource: file, ancestorMetaData })
          }
        }

        store.commit('Files/LOAD_FILES', {
          currentFolder,
          files: resources
        })
      } catch (error) {
        store.commit('Files/SET_CURRENT_FOLDER', null)
        console.error(error)

        if (error.statusCode === 401) {
          return authService.handleAuthError(unref(router.currentRoute))
        }
      }
    }).restartable()
  }
}
