import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import { Router } from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationPublicActive, isLocationSpacesActive } from '@ownclouders/web-pkg'
import { useCapabilityFilesSharingResharing } from '@ownclouders/web-pkg'
import {
  isPersonalSpaceResource,
  isPublicSpaceResource,
  isShareSpaceResource,
  SpaceResource
} from '@ownclouders/web-client/src/helpers'
import { unref } from 'vue'
import { FolderLoaderOptions } from './types'
import { authService } from 'web-runtime/src/services/auth'
import { useFileRouteReplace } from '@ownclouders/web-pkg'
import { aggregateResourceShares } from '@ownclouders/web-client/src/helpers/share'
import { getIndicators } from '@ownclouders/web-pkg'

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
          path,
          fileId
        })
        // if current folder has no id (= singe file public link) we must not correct the route
        if (currentFolder.id) {
          replaceInvalidFileRoute({ space, resource: currentFolder, path, fileId })
        }

        if (path === '/') {
          if (isShareSpaceResource(space)) {
            const parentShare = yield client.shares.getShare(space.shareId)
            const aggregatedShares = aggregateResourceShares({
              shares: [parentShare.shareInfo],
              spaces: store.getters['runtime/spaces/spaces'],
              allowSharePermission: unref(hasResharing),
              hasShareJail: true,
              incomingShares: true,
              fullShareOwnerPaths: configurationManager.options.routing.fullShareOwnerPaths
            })
            currentFolder = aggregatedShares[0]
          } else if (!isPersonalSpaceResource(space) && !isPublicSpaceResource(space)) {
            // note: in the future we might want to show the space as root for personal spaces as well (to show quota and the like). Currently not needed.
            currentFolder = space
          }
        }

        yield store.dispatch('runtime/ancestorMetaData/loadAncestorMetaData', {
          folder: currentFolder,
          space,
          client: webdav
        })

        if (options.loadShares) {
          const ancestorMetaData = store.getters['runtime/ancestorMetaData/ancestorMetaData']
          for (const file of resources) {
            file.indicators = getIndicators({ resource: file, ancestorMetaData })
          }
        }

        // TODO: remove when server returns share id for federated shares in propfind response
        if (space.shareId) {
          resources.forEach((r) => (r.shareId = space.shareId))
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
