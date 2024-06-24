import OidcCallbackPage from '../pages/oidcCallback.vue'
import { setupAuthGuard } from './setupAuthGuard'
import { patchRouter } from './patchCleanPath'
import {
  createWebHashHistory,
  createWebHistory,
  createRouter,
  RouteLocationNormalizedLoaded
} from 'vue-router'
import qs from 'qs'
import { ComponentLoader } from '@ownclouders/web-pkg'

export * from './helpers'
export { createRouter } from 'vue-router'

// just a dummy function to trick gettext tools
function $gettext(msg: string) {
  return msg
}

export const base = document.querySelector('base')
const routes = [
  {
    path: '/login',
    name: 'login',
    component: ComponentLoader(async () => (await import('../pages/login.vue')).default),
    meta: { title: $gettext('Login'), authContext: 'anonymous' }
  },
  {
    path: '/logout',
    name: 'logout',
    component: ComponentLoader(async () => (await import('../pages/logout.vue')).default),
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
    component: ComponentLoader(
      async () => (await import('../pages/resolvePrivateLink.vue')).default
    ),
    meta: { title: $gettext('Private link'), authContext: 'user' }
  },
  {
    path: '/s/:token/:driveAliasAndItem(.*)?',
    name: 'resolvePublicLink',
    component: ComponentLoader(
      async () => (await import('../pages/resolvePublicLink.vue')).default
    ),
    meta: { title: $gettext('Public link'), authContext: 'anonymous' }
  },
  {
    path: '/o/:token/:driveAliasAndItem(.*)?',
    name: 'resolvePublicOcmLink',
    component: ComponentLoader(
      async () => (await import('../pages/resolvePublicLink.vue')).default
    ),
    meta: { title: $gettext('OCM link'), authContext: 'anonymous' }
  },
  {
    path: '/access-denied',
    name: 'accessDenied',
    component: ComponentLoader(async () => (await import('../pages/accessDenied.vue')).default),
    meta: { title: $gettext('Access denied'), authContext: 'anonymous' }
  },
  {
    path: '/account',
    name: 'account',
    component: ComponentLoader(async () => (await import('../pages/account.vue')).default),
    meta: { title: $gettext('Account'), authContext: 'hybrid' }
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
