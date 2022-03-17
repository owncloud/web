import VueRouter, { RouteConfig, Route, Location, RouteMeta } from 'vue-router'
import { createLocationSpaces } from './spaces'
import { createLocationShares } from './shares'
import { createLocationCommon } from './common'
import { createLocationOperations } from './operations'
import { createLocationPublic } from './public'
import { isLocationActive as isLocationActiveNoCompat } from './utils'
import { createLocationTrash } from './trash'

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
      redirect: (to) => createLocationSpaces('files-spaces-personal-home', to)
    },
    {
      path: '/list/all/:item*',
      redirect: (to) => createLocationSpaces('files-spaces-personal-home', to)
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
      redirect: (to) => createLocationTrash('files-trash-personal', to)
    },
    {
      path: '/public/list/:item*',
      meta: {
        auth: false
      },
      redirect: (to) => createLocationPublic('files-public-files', to)
    },
    {
      path: '/private-link/:fileId',
      meta: {
        auth: false
      },
      redirect: (to) => createLocationOperations('files-operations-resolver-private-link', to)
    },
    {
      path: '/public-link/:token',
      meta: {
        auth: false
      },
      redirect: (to) => createLocationOperations('files-operations-resolver-public-link', to)
    }
  ].map(deprecatedRedirect)

/**
 * same as utils.isLocationActive with the difference that it remaps old route names to new ones and warns
 * @param router
 * @param comparatives
 */
export const isLocationActive = (
  router: VueRouter,
  ...comparatives: [Location, ...Location[]]
): boolean => {
  const [first, ...rest] = comparatives.map((c) => {
    const newName = {
      'files-personal': createLocationSpaces('files-spaces-personal-home').name,
      'files-favorites': createLocationCommon('files-common-favorites').name,
      'files-shared-with-others': createLocationShares('files-shares-with-others').name,
      'files-shared-with-me': createLocationShares('files-shares-with-me').name,
      'files-trashbin	': createLocationTrash('files-trash-personal').name,
      'files-public-list': createLocationPublic('files-public-files').name
    }[c.name]

    if (newName) {
      console.warn(`route name "${name}" is deprecated, use "${newName}" instead.`)
    }

    return {
      ...c,
      ...(!!newName && { name: newName })
    }
  })

  return isLocationActiveNoCompat(router, first, ...rest)
}
