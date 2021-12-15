import { RouteConfig, Route, Location, RouteMeta } from 'vue-router'
import { createLocationSpaces } from './spaces'
import { createLocationShares } from './shares'
import { createLocationCommon } from './common'

/**
 * all route configs created by buildRoutes are deprecated,
 * this helper wraps a route config and warns the user that it will go away and redirect to the new location.
 *
 * @param routeConfig
 */
const deprecatedRedirect = (routeConfig: {
  path: string
  meta?: RouteMeta
  redirect: (to: Route) => Location
}): RouteConfig => {
  return {
    meta: routeConfig.meta,
    path: routeConfig.path,
    redirect: (to) => {
      const location = routeConfig.redirect(to)

      console.warn(
        `route "${routeConfig.path}" is deprecated, use "${
          location.path || location.name
        }" instead.`
      )

      return location
    }
  }
}

/**
 * listed routes only exist to keep backwards compatibility intact,
 * all routes written in  a flat syntax to keep them readable.
 */
export const buildRoutes = (): RouteConfig[] =>
  [
    {
      path: '/list',
      redirect: (to) => createLocationSpaces(to)
    },
    {
      path: '/list/all/:item*',
      redirect: (to) => createLocationSpaces(to)
    },
    {
      path: '/list/favorites',
      redirect: (to) => createLocationCommon('files-common-favorites', to)
    },
    {
      path: '/list/shared-with-me',
      redirect: (to) => createLocationShares('files-shares-with-me', to)
    },
    {
      path: '/list/shared-with-others',
      redirect: (to) => createLocationShares('files-shares-with-others', to)
    },
    {
      path: '/list/shared-via-link',
      redirect: (to) => createLocationShares('files-shares-via-link', to)
    },
    {
      path: '/trash-bin',
      redirect: (to) => createLocationCommon('files-common-trash', to)
    },
    {
      path: '/public/list/:item*',
      meta: {
        auth: false
      },
      redirect: (to) => createLocationShares('files-shares-public-files', to)
    },
    {
      path: '/private-link/:fileId',
      meta: {
        auth: false
      },
      redirect: (to) => createLocationShares('files-shares-private-link', to)
    },
    {
      path: '/public-link/:token',
      meta: {
        auth: false
      },
      redirect: (to) => createLocationShares('files-shares-public-link', to)
    }
  ].map(deprecatedRedirect)
