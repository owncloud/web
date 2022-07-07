import qs from 'qs'
import Router from 'vue-router'
import AccessDeniedPage from '../pages/accessDenied.vue'
import Account from '../pages/account.vue'
import LoginPage from '../pages/login.vue'
import OidcCallbackPage from '../pages/oidcCallback.vue'
import ResolvePublicLinkPage from '../pages/resolvePublicLink.vue'
import { setupAuthGuard } from './setupAuthGuard'
import { patchRouter } from './patchCleanPath'

export * from './helpers'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

export const base = document.querySelector('base')
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
        meta: { title: $gettext('Login') }
      },
      {
        path: '/oidc-callback',
        name: 'oidcCallback',
        component: OidcCallbackPage,
        meta: { title: $gettext('Oidc callback') }
      },
      {
        path: '/oidc-silent-redirect',
        name: 'oidcSilentRedirect',
        component: OidcCallbackPage,
        meta: { title: $gettext('Oidc redirect') }
      },
      {
        path: '/f/:fileId',
        name: 'resolvePrivateLink',
        redirect: '/files/ops/resolver/private-link/:fileId',
        meta: { title: $gettext('Private link') }
      },
      {
        path: '/s/:token',
        name: 'resolvePublicLink',
        component: ResolvePublicLinkPage,
        meta: { title: $gettext('Public link') }
      },
      {
        path: '/access-denied',
        name: 'accessDenied',
        component: AccessDeniedPage,
        meta: { title: $gettext('Access denied') }
      },
      {
        path: '/account',
        name: 'account',
        component: Account,
        meta: { title: $gettext('Account') }
      }
    ]
  })
)

setupAuthGuard(router)
