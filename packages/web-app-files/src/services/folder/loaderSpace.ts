import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import { Router } from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationPublicActive, isLocationSpacesActive } from '../../router'
import {
  useCapabilityFilesSharingResharing,
  useCapabilityShareJailEnabled,
  useCapabilitySpacesEnabled
} from 'web-pkg/src/composables'
import { getIndicators } from '../../helpers/statusIndicators'
import { SpaceResource } from 'web-client/src/helpers'
import { unref } from 'vue'
import { FolderLoaderOptions } from './types'
import { authService } from 'web-runtime/src/services/auth'
import { useFileRouteReplace } from 'web-pkg/src/composables/router/useFileRouteReplace'
import { aggregateResourceShares } from '../../helpers/resources'

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
    const {
      store,
      router,
      clientService: { owncloudSdk: client, webdav }
    } = context
    const { replaceInvalidFileRoute } = useFileRouteReplace({ router })
    const hasShareJail = useCapabilityShareJailEnabled(store)
    const hasResharing = useCapabilityFilesSharingResharing(store)
    const hasSpaces = useCapabilitySpacesEnabled(store)

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
          path,
          fileId
        })
        replaceInvalidFileRoute({ space, resource: currentFolder, path, fileId })

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
          yield store.dispatch('Files/loadSharesTree', {
            client,
            path: currentFolder.path,
            ...(unref(hasSpaces) && { storageId: currentFolder.fileId }),
            includeRoot: currentFolder.path === '/' && space.driveType !== 'personal'
          })

          for (const file of resources) {
            file.indicators = getIndicators(file, store.state.Files.sharesTree, unref(hasShareJail))
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
          return authService.handleAuthError(router.currentRoute)
        }
      }
    }).restartable()
  }
}
