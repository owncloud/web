import Vue from 'vue'
import Router from 'vue-router'
import LoginPage from '../pages/login.vue'
import OidcCallbackPage from '../pages/oidcCallback.vue'
import OidcSilentRedirectPage from '../pages/oidcSilentRedirect.vue'
import ErrorPage from '../pages/error.vue'
import Account from '../pages/account.vue'

import store from '../store'

Vue.use(Router)

const router = new Router({
//  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'login',
      components: {
        fullscreen: LoginPage
      },
      meta: { auth: false, hideHeadbar: true }
    },
    {
      path: '/oidc-callback',
      components: {
        fullscreen: OidcCallbackPage
      },
      meta: { auth: false, hideHeadbar: true }
    },
    {
      path: '/oidc-silent-redirect',
      components: {
        fullscreen: OidcSilentRedirectPage
      },
      meta: { auth: false, hideHeadbar: true }
    },
    {
      path: '/error',
      name: 'error',
      component: ErrorPage,
      meta: { auth: false, hideHeadbar: true }
    },
    {
      path: '/account',
      name: 'account',
      components: {
        app: Account
      }
    }
  ]
})

router.beforeEach(function (to, from, next) {
  let authRequired = true
  if (to.meta.auth === false) {
    authRequired = false
  }
  if (authRequired) {
    if (store.getters.isAuthenticated) {
      next()
    } else {
      router.push({ name: 'login' })
    }
  } else {
    next()
  }
})

export default router
