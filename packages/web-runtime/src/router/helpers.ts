import { base, router } from './index'
import Router, { Route, RouteRecordPublic } from 'vue-router'
import { contextQueryToFileContextProps } from 'web-pkg/src/composables'

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
 * Checks if the `to` route or the route it was reached from (i.e. the `contextRoute`) needs authentication from the IDP.
 *
 * @param router {Router}
 * @param to {Route}
 * @returns {boolean}
 */
export const isUserContext = (router: Router, to: Route): boolean => {
  if (!isAuthenticationRequired(router, to)) {
    return false
  }

  if (to.meta?.auth !== false) {
    return true
  }

  const contextRoute = getContextRoute(router, to)
  return contextRoute && contextRoute.meta?.auth !== false
}

/**
 * Checks if the `to` route or the route it was reached from (i.e. the `contextRoute`) is a public link (with or without password).
 *
 * @param router {Router}
 * @param to {Route}
 * @returns {boolean}
 */
export const isPublicLinkContext = (router: Router, to: Route): boolean => {
  if (!isAuthenticationRequired(router, to)) {
    return false
  }

  const publicLinkRouteNames = ['files-public-files', 'files-public-drop']
  if (publicLinkRouteNames.includes(to.name)) {
    return true
  }

  const contextRoute = getContextRoute(router, to)
  return contextRoute && publicLinkRouteNames.includes(contextRoute?.name)
}

/**
 * Extracts the public link token from the various possible route params.
 *
 * @param to {Route}
 * @returns {string}
 */
export const extractPublicLinkToken = (to: Route): string => {
  const contextRouteParams = contextQueryToFileContextProps(to.query)?.routeParams
  if (contextRouteParams) {
    return (contextRouteParams.item || '').split('/')[0]
  }

  // CERN code to extract the token from a url that starts with /public
  let filePath
  if (to.params.filePath) {
    const pathElems = to.params.filePath.split('/')
    if (pathElems.length > 0) {
      filePath = pathElems[1]
    }
  }

  return (to.params.item || filePath || to.params.token || '').split('/')[0]
}

/**
 * Asserts whether any form of authentication is required, i.e.
 * - a user or
 * - public link (with or without password), which represents an impersonation of a user via public share
 *
 * @param router {Router}
 * @param to {Route}
 * @returns {boolean}
 */
export const isAuthenticationRequired = (router: Router, to: Route): boolean => {
  const publicRouteNames = [
    'login',
    'oidcCallback',
    'oidcSilentRedirect',
    'resolvePrivateLink',
    'resolvePublicLink',
    'accessDenied'
  ]

  if (publicRouteNames.includes(to.name)) {
    return false
  }

  const contextRoute = getContextRoute(router, to)
  if (publicRouteNames.includes(contextRoute?.name)) {
    return false
  }

  return true
}

/**
 * The contextRoute in URLs is used to give applications additional context where the application route was triggered from
 * (e.g. from a project space, a public link file listing, a personal space, etc).
 * Application routes need to fulfill both their own auth requirements and the auth requirements from the context route.
 *
 * Example: the `preview` app and its routes don't explicitly require authentication (`meta.auth` is set to `false`), because
 * the app can be used from both an authenticated context or from a public link context. The information which endpoint
 * the preview app is supposed to load files from is transported via the contextRouteName, contextRouteParams and contextRouteQuery
 * in the URL (provided by the context that opens the preview app in the first place).
 */
const getContextRoute = (router: Router, to: Route): RouteRecordPublic | null => {
  const contextRouteNameKey = 'contextRouteName'
  if (!to.query || !to.query[contextRouteNameKey]) {
    return null
  }

  return router.getRoutes().find((r) => r.name === to.query[contextRouteNameKey])
}
