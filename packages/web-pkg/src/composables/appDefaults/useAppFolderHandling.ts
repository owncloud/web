import { Ref, ref, unref, MaybeRef } from 'vue'
import { dirname } from 'path'
import { ClientService } from '../../services'
import { useAppFileHandling } from './useAppFileHandling'
import { Resource } from '@ownclouders/web-client'
import { FileContext } from './types'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { useFileRouteReplace } from '../router/useFileRouteReplace'
import { DavProperty } from '@ownclouders/web-client/webdav'
import { useAuthService } from '../authContext/useAuthService'
import { isMountPointSpaceResource } from '@ownclouders/web-client'
import { useResourcesStore, useSpacesStore } from '../piniaStores'
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
  const { webdav } = clientService
  const { replaceInvalidFileRoute } = useFileRouteReplace()
  const { getFileInfo } = useAppFileHandling({ clientService })
  const authService = useAuthService()
  const spacesStore = useSpacesStore()

  const resourcesStore = useResourcesStore()
  const { activeResources } = storeToRefs(resourcesStore)

  const loadFolderForFileContext = async (context: MaybeRef<FileContext>) => {
    isFolderLoading.value = true
    resourcesStore.clearResourceList()
    try {
      context = unref(context)
      const space = unref(context.space)

      const pathResource = await getFileInfo(context, {
        davProperties: [DavProperty.FileId, DavProperty.FileParent]
      })
      replaceInvalidFileRoute({
        space,
        resource: pathResource,
        path: unref(context.item),
        fileId: unref(context.itemId)
      })

      const isSpaceRoot = spacesStore.spaces.some(
        (s) => isMountPointSpaceResource(s) && s.root.remoteItem.id === pathResource.id
      )

      if (isSpaceRoot) {
        const resource = await getFileInfo(context)
        resourcesStore.initResourceList({ currentFolder: resource, resources: [resource] })
        isFolderLoading.value = false
        return
      }

      const { resource, children } = await webdav.listFiles(space, {
        fileId: pathResource.parentFolderId
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
