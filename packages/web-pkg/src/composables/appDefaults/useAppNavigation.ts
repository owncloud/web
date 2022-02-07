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

const paramsKey = 'contextRouteParams'

export const convertRouteParamsToContextQuery = (routeParams: LocationParams): LocationQuery => {
  const query = {}
  Object.keys(routeParams).forEach((key) => {
    query[`${paramsKey}[${key}]`] = routeParams[key]
  })
  return query
}

export const convertContextQueryToRouteParams = (query: LocationQuery): LocationParams => {
  const routeParams = {}
  const paramRegexp = new RegExp(`${paramsKey}\\[(.*)\\]`)
  Object.keys(query).forEach((paramName) => {
    const routeParamName = (paramName.match(paramRegexp) || [])[1]
    if (routeParamName) {
      routeParams[routeParamName] = query[paramName]
    }
  })
  return routeParams
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
