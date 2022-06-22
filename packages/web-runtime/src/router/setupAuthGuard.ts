import { isPublicLinkContext, isUserContext } from './index'
import Router from 'vue-router'
import Vue from 'vue'

export const setupAuthGuard = (router: Router) => {
  router.beforeEach(async (to, from, next) => {
    console.error('router.beforeEach from', from?.fullPath, from?.query)
    console.error('router.beforeEach to', to?.fullPath, to)

    const store = (Vue as any).$store
    const authService = (Vue as any).$authService

    await authService.initializeContext()

    if (isUserContext(router, to) && !store.getters['runtime/auth/isUserContextReady']) {
      return next({ path: '/login', query: { redirectUrl: to.fullPath } })
    }
    // TODO: implement public link context check (e.g. when visiting a bookmarked image preview from out of a public link)
    if (
      isPublicLinkContext(router, to) &&
      !store.getters['runtime/auth/isPublicLinkContextReady']
    ) {
      return next({ path: '/public/link/resolve/page', query: { redirectUrl: to.fullPath } })
    }

    next()
  })
}
