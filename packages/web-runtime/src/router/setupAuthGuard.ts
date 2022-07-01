import { extractPublicLinkToken, isPublicLinkContext, isUserContext } from './index'
import Router from 'vue-router'
import Vue from 'vue'

export const setupAuthGuard = (router: Router) => {
  router.beforeEach(async (to, from, next) => {
    if (to.path === from?.path) {
      // note: query changes can never trigger re-init of the auth context.
      return next()
    }

    const store = (Vue as any).$store
    const authService = (Vue as any).$authService
    await authService.initializeContext(to)

    if (isUserContext(router, to) && !store.getters['runtime/auth/isUserContextReady']) {
      return next({ path: '/login', query: { redirectUrl: to.fullPath } })
    }
    if (
      isPublicLinkContext(router, to) &&
      !store.getters['runtime/auth/isPublicLinkContextReady']
    ) {
      const publicLinkToken = extractPublicLinkToken(to)
      return next({
        name: 'resolvePublicLink',
        params: { token: publicLinkToken },
        query: { redirectUrl: to.fullPath }
      })
    }
    return next()
  })
}
