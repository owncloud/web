import { Ref, ref, unref, MaybeRef } from 'vue'
import { dirname } from 'path'
import { ClientService } from '../../services'
import { useAppFileHandling } from './useAppFileHandling'
import { buildIncomingShareResource, Resource } from '@ownclouders/web-client'
import { FileContext } from './types'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { useFileRouteReplace } from '../router/useFileRouteReplace'
import { DavProperty } from '@ownclouders/web-client/webdav'
import { useAuthService } from '../authContext/useAuthService'
import { isMountPointSpaceResource } from '@ownclouders/web-client'
import { useConfigStore, useResourcesStore, useSharesStore, useSpacesStore } from '../piniaStores'
import { storeToRefs } from 'pinia'

interface AppFolderHandlingOptions {
  currentRoute: Ref<RouteLocationNormalizedLoaded>
  clientService?: ClientService
}

export interface AppFolderHandlingResult {
  isFolderLoading: Ref<boolean>
  activeFiles: Ref<Array<Resource>>

  loadFolderForFileContext(context: MaybeRef<FileContext>): Promise<any>
}

export function useAppFolderHandling({
  currentRoute,
  clientService
}: AppFolderHandlingOptions): AppFolderHandlingResult {
  const isFolderLoading = ref(false)
  const { webdav, graphAuthenticated } = clientService
  const { replaceInvalidFileRoute } = useFileRouteReplace()
  const { getFileInfo } = useAppFileHandling({ clientService })
  const authService = useAuthService()
  const spacesStore = useSpacesStore()
  const sharesStore = useSharesStore()
  const configStore = useConfigStore()

  const resourcesStore = useResourcesStore()
  const { activeResources } = storeToRefs(resourcesStore)

  const loadFolderForFileContext = async (context: MaybeRef<FileContext>) => {
    isFolderLoading.value = true

    try {
      context = unref(context)

      if (context.routeName === 'files-shares-with-me') {
        // FIXME: this is a somewhat hacky solution to load the shared with me files.
        // ideally we should check if there is a current folder and if not, use the
        // folder loader to load files. unfortunately, it currently lives in the files app.
        const driveItems = await graphAuthenticated.driveItems.listSharedWithMe()

        const resources = driveItems.map((driveItem) =>
          buildIncomingShareResource({
            driveItem,
            graphRoles: sharesStore.graphRoles,
            serverUrl: configStore.serverUrl
          })
        )

        resourcesStore.initResourceList({ currentFolder: null, resources })
        isFolderLoading.value = false
        return
      }

      resourcesStore.clearResourceList()
      const space = unref(context.space)
      const pathResource = await getFileInfo(context, {
        davProperties: [DavProperty.FileId]
      })
      replaceInvalidFileRoute({
        space,
        resource: pathResource,
        path: unref(context.item),
        fileId: unref(context.itemId)
      })

      const isSpaceRoot = spacesStore.spaces.some(
        (s) => isMountPointSpaceResource(s) && s.root.remoteItem?.id === pathResource.id
      )

      if (isSpaceRoot) {
        const resource = await getFileInfo(context)
        resourcesStore.initResourceList({ currentFolder: resource, resources: [resource] })
        isFolderLoading.value = false
        return
      }

      const path = dirname(pathResource.path)
      const { resource, children } = await webdav.listFiles(space, {
        path
      })

      if (resource.type === 'file') {
        resourcesStore.initResourceList({
          // FIXME: currentFolder should be null?!
          currentFolder: resource,
          resources: [resource]
        })
      } else {
        resourcesStore.initResourceList({ currentFolder: resource, resources: children })
      }
    } catch (error) {
      if (error.statusCode === 401) {
        return authService.handleAuthError(unref(currentRoute))
      }
      resourcesStore.setCurrentFolder(null)
      console.error(error)
    }
    isFolderLoading.value = false
  }

  return {
    isFolderLoading,
    loadFolderForFileContext,
    activeFiles: activeResources
  }
}
