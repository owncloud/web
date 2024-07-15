import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import { Router } from 'vue-router'
import { useTask } from 'vue-concurrency'
import { isLocationPublicActive, isLocationSpacesActive } from '@ownclouders/web-pkg'
import {
  call,
  isPersonalSpaceResource,
  isPublicSpaceResource,
  isShareSpaceResource,
  SpaceResource
} from '@ownclouders/web-client'
import { unref } from 'vue'
import { FolderLoaderOptions } from './types'
import { authService } from 'web-runtime/src/services/auth'
import { useFileRouteReplace } from '@ownclouders/web-pkg'
import { IncomingShareResource } from '@ownclouders/web-client'
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
    const { router, clientService, resourcesStore, userStore } = context
    const { webdav } = clientService
    const { replaceInvalidFileRoute } = useFileRouteReplace({ router })

    return useTask(function* (
      signal1,
      signal2,
      space: SpaceResource,
      path: string = null,
      fileId: string = null,
      options: FolderLoaderOptions = {}
    ) {
      try {
        resourcesStore.clearResourceList()

        // eslint-disable-next-line prefer-const
        let { resource: currentFolder, children: resources } = yield* call(
          webdav.listFiles(space, { path, fileId })
        )
        // if current folder has no id (= singe file public link) we must not correct the route
        if (currentFolder.id) {
          replaceInvalidFileRoute({ space, resource: currentFolder, path, fileId })
        }

        if (path === '/') {
          if (isShareSpaceResource(space)) {
            // FIXME: it would be cleaner to fetch the driveItem as soon as graph api is capable of it
            currentFolder = {
              ...currentFolder,
              id: space.id,
              syncEnabled: true,
              canShare: () => false
            } as IncomingShareResource
          } else if (!isPersonalSpaceResource(space) && !isPublicSpaceResource(space)) {
            // note: in the future we might want to show the space as root for personal spaces as well (to show quota and the like). Currently not needed.
            currentFolder = space
          }
        }

        yield resourcesStore.loadAncestorMetaData({ folder: currentFolder, space, client: webdav })

        if (options.loadShares) {
          const ancestorMetaData = resourcesStore.ancestorMetaData
          for (const file of resources) {
            file.indicators = getIndicators({
              space,
              resource: file,
              ancestorMetaData,
              user: userStore.user
            })
          }
        }

        // TODO: remove when server returns share id for federated shares in propfind response
        if (isShareSpaceResource(space)) {
          resources.forEach((r) => (r.remoteItemId = space.id))
        }

        resourcesStore.initResourceList({ currentFolder, resources })
      } catch (error) {
        resourcesStore.setCurrentFolder(null)
        console.error(error)

        if (error.statusCode === 401) {
          return authService.handleAuthError(unref(router.currentRoute))
        }
      }
    }).restartable()
  }
}
