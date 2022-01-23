import { unref } from '@vue/composition-api'
import { basename, dirname } from 'path'
import VueRouter from 'vue-router'

import { MaybeRef } from '../../utils'
import { FileContext } from './types'

interface AppNavigationOptions {
  router: VueRouter
  currentFileContext: MaybeRef<FileContext>
}

export interface AppNavigationResult {
  closeApp(): void
}

export function useAppNavigation(options: AppNavigationOptions): AppNavigationResult {
  const navigateToContext = (context: MaybeRef<FileContext>) => {
    const router = options.router

    const { path, routeName } = unref(context)
    return router.push({
      name: unref(routeName),
      params: {
        item: dirname(unref(path)) || '/'
      },
      query: {
        scrollTo: basename(unref(path))
      }
    })
  }

  const closeApp = () => {
    return navigateToContext(options.currentFileContext)
  }

  return {
    closeApp
  }
}
