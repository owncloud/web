import Vue from 'vue'
import { isUserRequired } from './index'
import Router from 'vue-router'

export const setupAuthGuard = (router: Router) => {
  router.beforeEach(async (to, from, next) => {
    console.error('router.beforeEach from', from?.fullPath, from?.query)
    console.error('router.beforeEach to', to?.fullPath, to)

    const store = (Vue as any).$store
    const authService = (router as any).authService

    await authService.initializeUserManager()

    if (isUserRequired(router, to) && !store.getters.user.id) {
      return next({ path: '/login', query: { redirectUrl: to.fullPath } })
    }
    // TODO: we want to check if a public link password is required and if we have none -> redirect to new public link password input page

    next()
  })
}
