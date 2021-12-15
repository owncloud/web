import get from 'lodash-es/get.js'
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
      redirect: '/files/shares/private/link/:fileId',
      meta: { hideHeadbar: true, title: $gettext('Private link') }
    },
    {
      path: '/s/:token',
      name: 'publicLink',
      redirect: '/files/shares/public/link/:token',
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

router.beforeEach(function (to, from, next) {
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

// type: patch
// temporary patch till we have upgraded web to the latest vue router which make this obsolete
// this takes care that routes like 'foo/bar/baz' which by default would be converted to 'foo%2Fbar%2Fbaz' stay as they are
// should immediately go away and be removed after finalizing the update
// to apply the patch to a route add meta.patchCleanPath = true to it
// to patch needs to be enabled on a route level, to do so add meta.patchCleanPath = true property to the route
const patchRouter = (router) => {
  const bindMatcher = router.match.bind(router)
  const cleanPath = (route) =>
    [
      ['%2F', '/'],
      ['//', '/']
    ].reduce((path, rule) => path.replaceAll(rule[0], rule[1]), route || '')

  router.match = (raw, current, redirectFrom) => {
    const bindMatch = bindMatcher(raw, current, redirectFrom)

    if (!get(bindMatch, 'meta.patchCleanPath', false)) {
      return bindMatch
    }

    return {
      ...bindMatch,
      path: cleanPath(bindMatch.path),
      fullPath: cleanPath(bindMatch.fullPath)
    }
  }

  return router
}

export default patchRouter(router)
