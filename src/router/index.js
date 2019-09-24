import Vue from 'vue'
import Router from 'vue-router'
import LoginPage from '../pages/login.vue'
import OidcCallbackPage from '../pages/oidcCallback.vue'
import OidcSilentRedirectPage from '../pages/oidcSilentRedirect.vue'
import AccessDeniedPage from '../pages/accessDenied.vue'
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
      path: '/f/:fileId',
      name: 'privateLink',
      redirect: '/files/private-link/:fileId',
      meta: { hideHeadbar: true }
    },
    {
      path: '/s/:token',
      name: 'publicLink',
      redirect: '/files/public-link/:token',
      meta: { auth: false, hideHeadbar: true }
    },
    {
      path: '/access-denied',
      name: 'accessDenied',
      components: {
        fullscreen: AccessDeniedPage
      },
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
  const isAuthenticated = store.getters.isAuthenticated
  // Sets private link item id in case user is not authenticated to allow redirect after authorisation
  if (to.name === 'private-link' && !isAuthenticated) {
    const itemId = to.path.substr(to.path.lastIndexOf('/') + 1)
    store.dispatch('setPrivateLinkItemId', itemId)
  }
  let authRequired = true
  if (to.meta.auth === false) {
    authRequired = false
  }
  if (authRequired) {
    if (isAuthenticated) {
      next()
    } else {
      router.push({ name: 'login' })
    }
  } else {
    next()
  }
})

export default router
