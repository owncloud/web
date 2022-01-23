import { Store } from 'vuex'
import { computed, Ref, ref, unref } from '@vue/composition-api'
import { dirname } from 'path'

import { ClientService, clientService as defaultClientService } from '../../services'
import { MaybeRef } from '../../utils'

import { DavProperties } from '../../constants'
import { buildResource } from '../../../../web-app-files/src/helpers/resources'
import { Resource } from '../../../../web-app-files/src/helpers/resource'

import { FileContext } from './types'

interface AppFolderHandlingOptions {
  store: Store<any>
  clientService?: ClientService
  isPublicLinkContext: MaybeRef<boolean>
  publicLinkPassword: MaybeRef<string>
}

export interface AppFolderHandlingResult {
  isFolderLoading: Ref<boolean>
  activeFiles: Ref<Array<Resource>>

  loadFolderForFileContext(context: MaybeRef<FileContext>): Promise<any>
}

export function useAppFolderHandling(options: AppFolderHandlingOptions): AppFolderHandlingResult {
  const client = (options.clientService || defaultClientService).owncloudSdk
  const store = options.store

  const isPublicLinkContext = options.isPublicLinkContext
  const publicLinkPassword = options.publicLinkPassword

  const isFolderLoading = ref(false)
  const activeFiles = computed(() => {
    return store.getters['Files/activeFiles']
  })

  const loadFolder = async (absoluteDirPath: string) => {
    if (store.getters.activeFile.path !== '') {
      return
    }

    isFolderLoading.value = true
    store.commit('Files/CLEAR_CURRENT_FILES_LIST', null)
    try {
      const promise = unref(isPublicLinkContext)
        ? client.publicFiles.list(
            absoluteDirPath,
            unref(publicLinkPassword),
            DavProperties.PublicLink
          )
        : client.files.list(absoluteDirPath, 1, DavProperties.Default)
      let resources = await promise

      resources = resources.map(buildResource)
      store.commit('Files/LOAD_FILES', {
        currentFolder: resources[0],
        files: resources.slice(1)
      })
    } catch (error) {
      store.commit('Files/SET_CURRENT_FOLDER', null)
      console.error(error)
    }
    isFolderLoading.value = false
  }

  const loadFolderForFileContext = (context: MaybeRef<FileContext>) => {
    const { path } = unref(context)
    const absoluteDirPath = dirname(unref(path))
    return loadFolder(absoluteDirPath)
  }

  return {
    isFolderLoading,
    loadFolderForFileContext,
    activeFiles
  }
}
