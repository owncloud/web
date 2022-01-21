import { computed, unref, Ref } from '@vue/composition-api'
import { useRouter } from '../../../../web-app-files/src/composables/router/useRouter'
import { useStore } from '../../../../web-app-files/src/composables/store/useStore'
import { ClientService, clientService as defaultClientService } from '../../services'

import { FileContext } from './types'
import { useAppNavigation, AppNavigationResult } from './useAppNavigation'
import { useAppConfig, AppConfigResult } from './useAppConfig'
import { useAppFileHandling, AppFileHandlingResult } from './useAppFileHandling'
import { useAppFolderHandling, AppFolderHandlingResult } from './useAppFolderHandling'

// TODO: this file/folder contains file/folder loading logic extracted from mediaviewer and drawio extensions
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
  const clientService = options.clientService || defaultClientService

  const currentRoute = computed(() => {
    return router.currentRoute
  })

  const isPublicLinkContext = computed(() => {
    return unref(currentRoute).params.contextRouteName === 'files-public-files'
  })

  const publicLinkPassword = computed(() => {
    return store.getters['Files/publicLinkPassword']
  })

  const currentFileContext = computed((): FileContext => {
    return {
      routeName: unref(currentRoute).params.contextRouteName,
      path: `/${unref(currentRoute).params.filePath.split('/').filter(Boolean).join('/')}`
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
