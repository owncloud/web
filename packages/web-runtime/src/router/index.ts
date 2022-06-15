import get from 'lodash-es/get.js'
import Vue from 'vue'
import qs from 'qs'
// eslint-disable-next-line no-unused-vars
import Router, { Route, RouteRecordPublic } from 'vue-router'
import LoginPage from '../pages/login.vue'
import OidcCallbackPage from '../pages/oidcCallback.vue'
import AccessDeniedPage from '../pages/accessDenied.vue'
import Account from '../pages/account.vue'

Vue.use(Router)

// type: patch
// temporary patch till we have upgraded web to the latest vue router which make this obsolete
// this takes care that routes like 'foo/bar/baz' which by default would be converted to 'foo%2Fbar%2Fbaz' stay as they are
// should immediately go away and be removed after finalizing the update
// to apply the patch to a route add meta.patchCleanPath = true to it
// to patch needs to be enabled on a route level, to do so add meta.patchCleanPath = true property to the route
const patchRouter = (router: Router) => {
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

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const base = document.querySelector('base')
export const router = patchRouter(
  new Router({
    parseQuery(query) {
      return qs.parse(query, {
        allowDots: true
      })
    },
    stringifyQuery(obj) {
      return qs.stringify(obj, {
        allowDots: true,
        addQueryPrefix: true
      })
    },
    ...(base && {
      mode: 'history',
      base: new URL(base.href).pathname
    }),
    routes: [
      {
        path: '/login',
        name: 'login',
        component: LoginPage,
        meta: { __public: true, auth: false, title: $gettext('Login') }
      },
      {
        path: '/oidc-callback',
        component: OidcCallbackPage,
        meta: { __public: true, title: $gettext('Oidc callback') }
      },
      {
        path: '/oidc-silent-redirect',
        component: OidcCallbackPage,
        meta: { __public: true, title: $gettext('Oidc redirect') }
      },
      {
        path: '/f/:fileId',
        name: 'privateLink',
        redirect: '/files/ops/resolver/private-link/:fileId',
        meta: { __public: true, title: $gettext('Private link') }
      },
      {
        path: '/s/:token',
        name: 'publicLink',
        redirect: '/files/ops/resolver/public-link/:token',
        meta: { __public: true, title: $gettext('Public link') }
      },
      {
        path: '/access-denied',
        name: 'accessDenied',
        component: AccessDeniedPage,
        meta: { __public: true, title: $gettext('Access denied') }
      },
      {
        path: '/account',
        name: 'account',
        component: Account,
        meta: { __public: true, title: $gettext('Account') }
      }
    ]
  })
)

export const buildUrl = (pathname) => {
  const isHistoryMode = !!base
  const baseUrl = new URL(window.location.href.split('#')[0])
  if (isHistoryMode) {
    // in history mode we can't determine the base path, it must be provided by the document
    baseUrl.pathname = new URL(base.href).pathname
  } else {
    // in hash mode, auto-determine the base path by removing `/index.html`
    if (baseUrl.pathname.endsWith('/index.html')) {
      baseUrl.pathname = baseUrl.pathname.split('/').slice(0, -1).filter(Boolean).join('/')
    }
  }

  /**
   * build full url by either
   * - concatenating baseUrl and pathname (for unknown/non-router urls, e.g. `oidc-callback.html`) or
   * - resolving via router (for known routes)
   */
  if (/\.(html?)$/i.test(pathname)) {
    baseUrl.pathname = [...baseUrl.pathname.split('/'), ...pathname.split('/')]
      .filter(Boolean)
      .join('/')
  } else {
    baseUrl[isHistoryMode ? 'pathname' : 'hash'] = router.resolve(pathname).href
  }

  return baseUrl.href
}

let waitForUserToBeAvailable = false
router.beforeEach(async (to, from, next) => {
  console.log('router.beforeEach', to, from, (router as any).authService)
  if (to.path === '/oidc-callback') {
    waitForUserToBeAvailable = true
  }

  const store = (Vue as any).$store
  const authService = (router as any).authService

  console.log('router', router)

  await authService.initializeUserManager()

  const isAuthenticated = store.getters.isAuthenticated
  console.log('******* user available:', {
    isAuthenticated,
    isUserRequired: isUserRequired(router, to),
    waitForUserToBeAvailable
  })

  if (isUserRequired(router, to)) {
    if (!isAuthenticated && waitForUserToBeAvailable) {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve('waiting 1 second')
        }, 1000)
      })
      const user = await authService.getUserPromise
      console.log('user available', user)
    }

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
export const isUserRequired = (router: Router, to: Route): boolean => {
  if (!isAuthenticationRequired(router, to)) {
    return false
  }

  if (to.meta?.auth !== false) {
    return true
  }

  const contextRoute = getContextRoute(router, to)
  if (contextRoute?.meta?.auth !== false) {
    return true
  }

  return false
}

/**
 * The contextRouteName in routes is used to give applications additional context where the new route was triggered from.
 * This means that the new route needs to fulfill both its own auth requirements and the auth requirements from the context route.
 */
const getContextRoute = (router: Router, to: Route): RouteRecordPublic | null => {
  const contextRouteNameKey = 'contextRouteName'
  if (!to.query || !to.query[contextRouteNameKey]) {
    return null
  }

  return router.getRoutes().find((r) => r.name === to.query[contextRouteNameKey])
}

export const isAuthenticationRequired = (router: Router, to: Route): boolean => {
  if (to.meta?.__public === true) {
    return false
  }

  const contextRoute = getContextRoute(router, to)
  if (contextRoute?.meta?.__public) {
    return false
  }

  return true
}
