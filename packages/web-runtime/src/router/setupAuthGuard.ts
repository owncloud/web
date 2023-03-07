import { extractPublicLinkToken, isPublicLinkContext, isUserContext } from './index'
import { Router, RouteLocation } from 'vue-router'
import { contextRouteNameKey, queryItemAsString } from 'web-pkg/src/composables'
import { authService } from '../services/auth/authService'

export const setupAuthGuard = (router: Router) => {
  router.beforeEach(async (to, from) => {
    if (from && to.path === from.path && !hasContextRouteNameChanged(to, from)) {
      // note: except for the context route, query changes can never trigger re-init of the auth context
      return true
    }

    const store = (window as any).__$store
    await authService.initializeContext(to)

    // vue-router currently (4.1.6) does not cancel navigations when a new one is triggered
    // we need to guard this case to be able to show the access denied page
    // and not be redirected to the login page
    if (authService.hasAuthErrorOccured) {
      return to.name === 'accessDenied' || to.name === 'login' || { name: 'accessDenied' }
    }

    if (isPublicLinkContext(router, to)) {
      if (!store.getters['runtime/auth/isPublicLinkContextReady']) {
        const publicLinkToken = extractPublicLinkToken(to)
        return {
          name: 'resolvePublicLink',
          params: { token: publicLinkToken },
          query: { redirectUrl: to.fullPath }
        }
      }
      return true
    }

    if (isUserContext(router, to)) {
      if (!store.getters['runtime/auth/isUserContextReady']) {
        return { path: '/login', query: { redirectUrl: to.fullPath } }
      }
      return true
    }
    return true
  })
  router.afterEach((to) => {
    if (to.name !== 'accessDenied') {
      return
    }
    authService.hasAuthErrorOccured = false
  })
}

export const hasContextRouteNameChanged = (to: RouteLocation, from: RouteLocation): boolean => {
  if (!to.query[contextRouteNameKey] && !from.query[contextRouteNameKey]) {
    return false
  }

  return (
    queryItemAsString(to.query[contextRouteNameKey]) !==
    queryItemAsString(from.query[contextRouteNameKey])
  )
}
