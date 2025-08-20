import AccessDeniedPage from '../pages/accessDenied.vue'
import Account from '../pages/account.vue'
import LoginPage from '../pages/login.vue'
import LogoutPage from '../pages/logout.vue'
import NotFoundPage from '../pages/notFound.vue'
import OidcCallbackPage from '../pages/oidcCallback.vue'
import ResolvePublicLinkPage from '../pages/resolvePublicLink.vue'
import ResolvePrivateLinkPage from '../pages/resolvePrivateLink.vue'
import { setupAuthGuard } from './setupAuthGuard'
import { patchRouter } from './patchCleanPath'
import {
  createWebHashHistory,
  createWebHistory,
  createRouter,
  RouteLocationNormalizedLoaded
} from 'vue-router'

// @ts-ignore
import qs from 'qs'

export * from './helpers'
export { createRouter } from 'vue-router'

// just a dummy function to trick gettext tools
function $gettext(msg: string) {
  return msg
}

export const base = document.querySelector('base')

function accountAcrGuard(to, from) {
  if (typeof window === 'undefined') {
    return true
  }
  const hasStepupParam = !!to.query.stepup
  const hasGlobalStepupFlag = new URLSearchParams(window.location.search).has('stepupAcr')
  const stepupKey = 'oc.stepup:account'
  const alreadyRequested = sessionStorage.getItem(stepupKey) === '1'
  console.debug('[accountAcrGuard] enter', {
    to: to.fullPath,
    hasStepupParam,
    hasGlobalStepupFlag,
    alreadyRequested
  })
  if (!hasStepupParam && !hasGlobalStepupFlag && !alreadyRequested) {
    const redirectUrl = to.fullPath + (to.fullPath.includes('?') ? '&' : '?') + 'stepup=1'
    try {
      sessionStorage.setItem(stepupKey, '1')
    } catch (_) {}
    console.info('[accountAcrGuard] initiating step-up', { redirectUrl })
    window.location.assign(`/?stepupAcr=advanced&redirectUrl=${encodeURIComponent(redirectUrl)}`)
    return false
  }
  console.debug('[accountAcrGuard] pass-through')
  return true
}
const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { title: $gettext('Login'), authContext: 'anonymous' }
  },
  {
    path: '/logout',
    name: 'logout',
    component: LogoutPage,
    meta: { title: $gettext('Logout'), authContext: 'anonymous' }
  },
  {
    path: '/web-oidc-callback',
    name: 'oidcCallback',
    component: OidcCallbackPage,
    meta: { title: $gettext('Oidc callback'), authContext: 'anonymous' }
  },
  {
    path: '/web-oidc-silent-redirect',
    name: 'oidcSilentRedirect',
    component: OidcCallbackPage,
    meta: { title: $gettext('Oidc redirect'), authContext: 'anonymous' }
  },
  {
    path: '/f/:fileId',
    name: 'resolvePrivateLink',
    component: ResolvePrivateLinkPage,
    meta: { title: $gettext('Private link'), authContext: 'user' }
  },
  {
    path: '/s/:token/:driveAliasAndItem(.*)?',
    name: 'resolvePublicLink',
    component: ResolvePublicLinkPage,
    meta: { title: $gettext('Public link'), authContext: 'anonymous' }
  },
  {
    path: '/i/:token/:driveAliasAndItem(.*)?',
    name: 'resolveInternalLink',
    component: ResolvePublicLinkPage,
    meta: { title: $gettext('Internal link'), authContext: 'user' }
  },
  {
    path: '/o/:token/:driveAliasAndItem(.*)?',
    name: 'resolvePublicOcmLink',
    component: ResolvePublicLinkPage,
    meta: { title: $gettext('OCM link'), authContext: 'anonymous' }
  },
  {
    path: '/access-denied',
    name: 'accessDenied',
    component: AccessDeniedPage,
    meta: { title: $gettext('Access denied'), authContext: 'anonymous' }
  },
  {
    path: '/account',
    name: 'account',
    component: Account,
    beforeEnter: accountAcrGuard,
    meta: { title: $gettext('Account'), authContext: 'hybrid' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: NotFoundPage,
    meta: { title: $gettext('Not found'), authContext: 'hybrid' }
  }
]
export const router = patchRouter(
  createRouter({
    parseQuery(query) {
      return qs.parse(query, {
        allowDots: true
      })
    },
    stringifyQuery(obj) {
      return qs.stringify(obj, {
        allowDots: true
      })
    },
    history: (base && createWebHistory(new URL(base.href).pathname)) || createWebHashHistory(),
    routes
  })
)

export const isRuntimeRoute = (route: RouteLocationNormalizedLoaded) => {
  return routes.map((r) => r.name).includes(route.name.toString())
}

setupAuthGuard(router)
