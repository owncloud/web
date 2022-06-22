import Vue from 'vue'
import qs from 'qs'
import Router from 'vue-router'
import LoginPage from '../pages/login.vue'
import OidcCallbackPage from '../pages/oidcCallback.vue'
import AccessDeniedPage from '../pages/accessDenied.vue'
import Account from '../pages/account.vue'
import { setupAuthGuard } from './setupAuthGuard'
import { patchRouter } from './patchCleanPath'

Vue.use(Router)

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

setupAuthGuard(router)
