import { unref } from '@vue/composition-api'
import { basename } from 'path'
import VueRouter from 'vue-router'

import { MaybeRef } from '../../utils'
import { FileContext } from './types'
import { LocationQuery, LocationParams } from '../router'

interface AppNavigationOptions {
  router: VueRouter
  currentFileContext: MaybeRef<FileContext>
}

export interface AppNavigationResult {
  closeApp(): void
}

const contextRouteParamsKey = 'contextRouteParams'

/*
  vue-router type bindings do not allow nested objects
  because they are not handled by default. We override
  parseQuery and stringifyQuery and handle it there.
  That's why we have types that match the router types
  and break them here once on purpose in encapsulated
  functions
*/
export const convertRouteParamsToContextQuery = (routeParams: LocationParams): LocationQuery => {
  return {
    [contextRouteParamsKey]: routeParams
  } as any
}
export const convertContextQueryToRouteParams = (query: LocationQuery): LocationParams => {
  return query[contextRouteParamsKey] as any
}

export function useAppNavigation(options: AppNavigationOptions): AppNavigationResult {
  const navigateToContext = (context: MaybeRef<FileContext>) => {
    const router = options.router

    const { path, routeName, routeParams } = unref(context)

    return router.push({
      name: unref(routeName),
      params: unref(routeParams),
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
