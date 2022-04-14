import { computed, unref, Ref } from '@vue/composition-api'
import { useRouter, useRoute } from '../router'
import { useStore } from '../store'
import { ClientService, clientService as defaultClientService } from '../../services'
import { basename } from 'path'

import { FileContext } from './types'
import {
  useAppNavigation,
  AppNavigationResult,
  contextQueryToFileContextProps,
  contextRouteNameKey
} from './useAppNavigation'
import { useAppConfig, AppConfigResult } from './useAppConfig'
import { useAppFileHandling, AppFileHandlingResult } from './useAppFileHandling'
import { useAppFolderHandling, AppFolderHandlingResult } from './useAppFolderHandling'

// TODO: this file/folder contains file/folder loading logic extracted from preview and drawio extensions
// Discussion how to progress from here can be found in this issue:
// https://github.com/owncloud/web/issues/3301

interface AppDefaultsOptions {
  applicationName: string
  clientService?: ClientService
}

type AppDefaultsResult = AppConfigResult &
  AppNavigationResult &
  AppFileHandlingResult &
  AppFolderHandlingResult & {
    isPublicLinkContext: Ref<boolean>
    currentFileContext: Ref<FileContext>
  }

export function useAppDefaults(options: AppDefaultsOptions): AppDefaultsResult {
  const router = useRouter()
  const store = useStore()
  const currentRoute = useRoute()
  const clientService = options.clientService || defaultClientService

  const isPublicLinkContext = computed(() => {
    return unref(currentRoute).query[contextRouteNameKey] === 'files-public-files'
  })

  const publicLinkPassword = computed(() => {
    return store.getters['Files/publicLinkPassword']
  })

  const currentFileContext = computed((): FileContext => {
    const queryItemAsString = (queryItem: string | string[]) => {
      if (Array.isArray(queryItem)) {
        return queryItem[0]
      }

      return queryItem
    }

    const path = `/${unref(currentRoute).params.filePath.split('/').filter(Boolean).join('/')}`

    return {
      path,
      fileName: basename(path),
      routeName: queryItemAsString(unref(currentRoute).query[contextRouteNameKey]),
      ...contextQueryToFileContextProps(unref(currentRoute).query)
    }
  })

  return {
    isPublicLinkContext,
    currentFileContext,

    ...useAppConfig({ store, ...options }),
    ...useAppNavigation({ router, currentFileContext }),
    ...useAppFileHandling({ clientService, store, isPublicLinkContext, publicLinkPassword }),
    ...useAppFolderHandling({ clientService, store, isPublicLinkContext, publicLinkPassword })
  }
}
