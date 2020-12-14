import Vue from 'vue'
import Router from 'vue-router'
import LoginPage from '../pages/login.vue'
import OidcCallbackPage from '../pages/oidcCallback.vue'
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
        fullscreen: OidcCallbackPage
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

router.beforeEach(function(to, from, next) {
  const isAuthenticated = store.getters.isAuthenticated
  let authRequired = true
  if (to.meta.auth === false) {
    authRequired = false
  }
  if (authRequired) {
    if (isAuthenticated) {
      const url = store.getters.urlBeforeLogin
      store.dispatch('saveUrlBeforeLogin', null)
      if (url) {
        next(url)
      } else {
        next()
      }
    } else {
      store.dispatch('saveUrlBeforeLogin', to.fullPath)
      next('/login')
    }
  } else {
    next()
  }
})

/* TODO: upgrade to vue next router */
/* monkey patch like back in the good old ROR times ;) */
/* it works across all modules and extensions because router is treated as singleton by vue itself */
/* as alternative we can use arrays for paths for (https://github.com/pillarjs/path-to-regexp) but this needs to many changes in most places */
router.match = (oc => {
  return (raw, current, redirectFrom) => {
    const oo = oc(raw, current, redirectFrom)
    const no = {
      ...oo,
      fullPath: [{ f: /%2F/g, t: '/' }, { f: /\/\//g, t: '/' }].reduce(
        (acc, r) => acc.replaceAll(r.f, r.t),
        oo.fullPath || ''
      )
    }
    return Object.freeze(no)
  }
})(router.match.bind(router))

export default router
