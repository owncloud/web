import { Store } from 'vuex'
import { computed, Ref, ref, unref } from '@vue/composition-api'
import { dirname } from 'path'

import { ClientService } from '../../services'
import { MaybeRef } from '../../utils'

import { DavProperties } from '../../constants'
import { buildResource } from '../../../../web-app-files/src/helpers/resources'
import { Resource } from 'web-client'

import { FileContext } from './types'
import { authService } from 'web-runtime/src/services/auth'
import { Route } from 'vue-router'

interface AppFolderHandlingOptions {
  store: Store<any>
  currentRoute: Ref<Route>
  clientService?: ClientService
  publicLinkPassword: MaybeRef<string>
}

export interface AppFolderHandlingResult {
  isFolderLoading: Ref<boolean>
  activeFiles: Ref<Array<Resource>>

  loadFolderForFileContext(context: MaybeRef<FileContext>): Promise<any>
}

export function useAppFolderHandling({
  store,
  currentRoute,
  clientService: { owncloudSdk: client, webdav },
  publicLinkPassword
}: AppFolderHandlingOptions): AppFolderHandlingResult {
  const isFolderLoading = ref(false)
  const activeFiles = computed(() => {
    return store.getters['Files/activeFiles']
  })

  const loadFolderForFileContext = async (context: MaybeRef<FileContext>) => {
    if (store.getters.activeFile && store.getters.activeFile.path !== '') {
      return
    }

    isFolderLoading.value = true
    store.commit('Files/CLEAR_CURRENT_FILES_LIST', null)
    try {
      context = unref(context)
      const space = unref(context.space)
      const path = dirname(unref(context.item))

      const resources = await webdav.listFiles(space, {
        path,
        publicLinkPassword: unref(publicLinkPassword)
      })

      store.commit('Files/LOAD_FILES', {
        currentFolder: resources[0],
        files: resources.slice(1)
      })
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
