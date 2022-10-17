import { Store } from 'vuex'
import { computed, Ref, ref, unref } from '@vue/composition-api'
import { dirname } from 'path'

import { ClientService } from '../../services'
import { MaybeRef } from '../../utils'

import { Resource } from 'web-client'

import { FileContext } from './types'
import { Route } from 'vue-router'
import { useAppFileHandling } from './useAppFileHandling'
import { useFileRouteReplace } from '../router/useFileRouteReplace'
import { DavProperty } from '../../../../web-client/src/webdav/constants'
import { useAuthService } from '../authContext/useAuthService'

interface AppFolderHandlingOptions {
  store: Store<any>
  currentRoute: Ref<Route>
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

      const path = dirname(pathResource.path)
      const resources = await webdav.listFiles(space, {
        path
      })

      if (resources[0].type === 'file') {
        store.commit('Files/LOAD_FILES', {
          currentFolder: resources[0],
          files: [resources[0]]
        })
      } else {
        store.commit('Files/LOAD_FILES', {
          currentFolder: resources[0],
          files: resources.slice(1)
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
