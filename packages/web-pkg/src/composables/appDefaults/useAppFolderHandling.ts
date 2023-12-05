import { Store } from 'vuex'
import { computed, Ref, ref, unref, MaybeRef } from 'vue'
import { dirname } from 'path'
import { ClientService } from '../../services'
import { useAppFileHandling } from './useAppFileHandling'
import { Resource } from '@ownclouders/web-client'
import { FileContext } from './types'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { useFileRouteReplace } from '../router/useFileRouteReplace'
import { DavProperty } from '@ownclouders/web-client/src/webdav/constants'
import { useAuthService } from '../authContext/useAuthService'
import { isMountPointSpaceResource } from '@ownclouders/web-client/src/helpers'

interface AppFolderHandlingOptions {
  store: Store<any>
  currentRoute: Ref<RouteLocationNormalizedLoaded>
  clientService?: ClientService
}

export interface AppFolderHandlingResult {
  isFolderLoading: Ref<boolean>
  activeFiles: Ref<Array<Resource>>

  loadFolderForFileContext(context: MaybeRef<FileContext>): Promise<any>
}

export function useAppFolderHandling({
  store,
  currentRoute,
  clientService
}: AppFolderHandlingOptions): AppFolderHandlingResult {
  const isFolderLoading = ref(false)
  const activeFiles = computed(() => {
    return store.getters['Files/activeFiles']
  })
  const { webdav } = clientService
  const { replaceInvalidFileRoute } = useFileRouteReplace()
  const { getFileInfo } = useAppFileHandling({ clientService })
  const authService = useAuthService()

  const loadFolderForFileContext = async (context: MaybeRef<FileContext>) => {
    if (store.getters.activeFile && store.getters.activeFile.path !== '') {
      return
    }

    isFolderLoading.value = true
    store.commit('Files/CLEAR_CURRENT_FILES_LIST', null)
    try {
      context = unref(context)
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

      const isSpaceRoot = store.getters['runtime/spaces/spaces'].some(
        (s) => isMountPointSpaceResource(s) && s.root.remoteItem.id === pathResource.id
      )

      if (isSpaceRoot) {
        const resource = await getFileInfo(context)
        store.commit('Files/LOAD_FILES', {
          currentFolder: resource,
          files: [resource]
        })
        isFolderLoading.value = false
        return
      }

      const path = dirname(pathResource.path)
      const { resource, children } = await webdav.listFiles(space, {
        path
      })

      if (resource.type === 'file') {
        store.commit('Files/LOAD_FILES', {
          // FIXME: currentFolder should be null?!
          currentFolder: resource,
          files: [resource]
        })
      } else {
        store.commit('Files/LOAD_FILES', {
          currentFolder: resource,
          files: children
        })
      }
    } catch (error) {
      if (error.statusCode === 401) {
        return authService.handleAuthError(unref(currentRoute))
      }
      store.commit('Files/SET_CURRENT_FOLDER', null)
      console.error(error)
    }
    isFolderLoading.value = false
  }

  return {
    isFolderLoading,
    loadFolderForFileContext,
    activeFiles
  }
}
