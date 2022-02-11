import get from 'lodash-es/get.js'
import Vue from 'vue'
// eslint-disable-next-line no-unused-vars
import Router, { Route } from 'vue-router'
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
      component: LoginPage,
      meta: { auth: false, title: $gettext('Login') }
    },
    {
      path: '/oidc-callback',
      name: 'oidcCallback',
      component: OidcCallbackPage,
      meta: { auth: false, title: $gettext('Oidc callback') }
    },
    {
      path: '/oidc-silent-redirect',
      name: 'oidcSilentRedirect',
      component: OidcCallbackPage,
      meta: { auth: false, title: $gettext('Oidc redirect') }
    },
    {
      path: '/f/:fileId',
      name: 'privateLink',
      redirect: '/files/ops/resolver/private-link/:fileId',
      meta: { title: $gettext('Private link') }
    },
    {
      path: '/s/:token',
      name: 'publicLink',
      redirect: '/files/ops/resolver/public-link/:token',
      meta: { auth: false, title: $gettext('Public link') }
    },
    {
      path: '/access-denied',
      name: 'accessDenied',
      component: AccessDeniedPage,
      meta: { auth: false, title: $gettext('Access denied') }
    },
    {
      path: '/account',
      name: 'account',
      component: Account,
      meta: { title: $gettext('Account') }
    }
  ]
})

router.beforeEach(function (to, from, next) {
  const store = Vue.$store
  const isAuthenticated = store.getters.isAuthenticated
  if (isAuthRequired(router, to)) {
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

/**
 * Checks if the `to` route needs authentication from the IDP by checking both the route itself and - if present - also the context route.
 *
 * @param router {Router}
 * @param to {Route}
 * @returns {boolean}
 */
const isAuthRequired = (router, to) => {
  if (to.meta?.auth !== false) {
    return true
  }

  /**
   * The contextRouteName in routes is used to give applications additional context where the new route was triggered from.
   * This means that the new route needs to fulfill both its own auth requirements and the auth requirements from the context route.
   */
  if (!to.params?.contextRouteName) {
    return false
  }

  const contextRoute = router.getRoutes().find((r) => r.name === to.params.contextRouteName)
  if (contextRoute) {
    return contextRoute.meta?.auth !== false
  }
  return false
}

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
