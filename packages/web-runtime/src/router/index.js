import Vue from 'vue'
import Router from 'vue-router'
import LoginPage from '../pages/login.vue'
import OidcCallbackPage from '../pages/oidcCallback.vue'
import AccessDeniedPage from '../pages/accessDenied.vue'
import Account from '../pages/account.vue'

Vue.use(Router)

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const router = new Router({
  //  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'login',
      components: {
        fullscreen: LoginPage
      },
      meta: { auth: false, hideHeadbar: true, title: $gettext('Login') }
    },
    {
      path: '/oidc-callback',
      components: {
        fullscreen: OidcCallbackPage
      },
      meta: { auth: false, hideHeadbar: true, title: $gettext('Oidc callback') }
    },
    {
      path: '/oidc-silent-redirect',
      components: {
        fullscreen: OidcCallbackPage
      },
      meta: { auth: false, hideHeadbar: true, title: $gettext('Oidc redirect') }
    },
    {
      path: '/f/:fileId',
      name: 'privateLink',
      redirect: '/files/private-link/:fileId',
      meta: { hideHeadbar: true, title: $gettext('Private link') }
    },
    {
      path: '/s/:token',
      name: 'publicLink',
      redirect: '/files/public-link/:token',
      meta: { auth: false, hideHeadbar: true, title: $gettext('Public link') }
    },
    {
      path: '/access-denied',
      name: 'accessDenied',
      components: {
        fullscreen: AccessDeniedPage
      },
      meta: { auth: false, hideHeadbar: true, title: $gettext('Access denied') }
    },
    {
      path: '/account',
      name: 'account',
      components: {
        app: Account
      },
      meta: { title: $gettext('Account') }
    }
  ]
})

router.beforeEach(function(to, from, next) {
  const store = Vue.$store
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

export default router
