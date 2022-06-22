import { base, router } from './index'
import Router, { Route, RouteRecordPublic } from 'vue-router'

export const buildUrl = (pathname) => {
  const isHistoryMode = !!base
  const baseUrl = new URL(window.location.href.split('#')[0])
  baseUrl.search = ''
  if (isHistoryMode) {
    // in history mode we can't determine the base path, it must be provided by the document
    baseUrl.pathname = new URL(base.href).pathname
  } else {
    // in hash mode, auto-determine the base path by removing `/index.html`
    if (baseUrl.pathname.endsWith('/index.html')) {
      baseUrl.pathname = baseUrl.pathname.split('/').slice(0, -1).filter(Boolean).join('/')
    }
  }

  /**
   * build full url by either
   * - concatenating baseUrl and pathname (for unknown/non-router urls, e.g. `oidc-callback.html`) or
   * - resolving via router (for known routes)
   */
  if (/\.(html?)$/i.test(pathname)) {
    baseUrl.pathname = [...baseUrl.pathname.split('/'), ...pathname.split('/')]
      .filter(Boolean)
      .join('/')
  } else {
    baseUrl[isHistoryMode ? 'pathname' : 'hash'] = router.resolve(pathname).href
  }

  return baseUrl.href
}

/**
 * Checks if the `to` route needs authentication from the IDP by checking both the route itself and - if present - also the context route.
 *
 * @param router {Router}
 * @param to {Route}
 * @returns {boolean}
 */
export const isUserRequired = (router: Router, to: Route): boolean => {
  if (!isAuthenticationRequired(router, to)) {
    return false
  }

  if (to.meta?.auth !== false) {
    return true
  }

  const contextRoute = getContextRoute(router, to)
  if (contextRoute?.meta?.auth !== false) {
    return true
  }

  return false
}

/**
 * The contextRouteName in routes is used to give applications additional context where the new route was triggered from.
 * This means that the new route needs to fulfill both its own auth requirements and the auth requirements from the context route.
 */
const getContextRoute = (router: Router, to: Route): RouteRecordPublic | null => {
  const contextRouteNameKey = 'contextRouteName'
  if (!to.query || !to.query[contextRouteNameKey]) {
    return null
  }

  return router.getRoutes().find((r) => r.name === to.query[contextRouteNameKey])
}

export const isAuthenticationRequired = (router: Router, to: Route): boolean => {
  if (to.meta?.__public === true) {
    return false
  }

  const contextRoute = getContextRoute(router, to)
  if (contextRoute?.meta?.__public) {
    return false
  }

  return true
}
