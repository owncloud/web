import { extractPublicLinkToken, isPublicLinkContext, isUserContext } from './index'
import { Router, RouteLocation } from 'vue-router'
import Vue from 'vue'
import { contextRouteNameKey, queryItemAsString } from 'web-pkg/src/composables'

export const setupAuthGuard = (router: Router) => {
  router.beforeEach(async (to, from, next) => {
    if (from && to.path === from.path && !hasContextRouteNameChanged(to, from)) {
      // note: except for the context route, query changes can never trigger re-init of the auth context
      return next()
    }

    const store = (Vue as any).$store
    const authService = (Vue as any).$authService
    await authService.initializeContext(to)

    if (isPublicLinkContext(router, to)) {
      if (!store.getters['runtime/auth/isPublicLinkContextReady']) {
        const publicLinkToken = extractPublicLinkToken(to)
        return next({
          name: 'resolvePublicLink',
          params: { token: publicLinkToken },
          query: { redirectUrl: to.fullPath }
        })
      }
      return next()
    }
    if (isUserContext(router, to)) {
      if (!store.getters['runtime/auth/isUserContextReady']) {
        return next({ path: '/login', query: { redirectUrl: to.fullPath } })
      }
      return next()
    }
    return next()
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
