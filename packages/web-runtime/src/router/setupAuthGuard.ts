import {
  extractPublicLinkToken,
  isIdpContextRequired,
  isPublicLinkContextRequired,
  isUserContextRequired
} from './index'
import { Router, RouteLocation } from 'vue-router'
import {
  contextRouteNameKey,
  queryItemAsString,
  useAuthStore,
  useEmbedMode
} from '@ownclouders/web-pkg'
import { authService } from '../services/auth/authService'
import { unref } from 'vue'

export const setupAuthGuard = (router: Router) => {
  router.beforeEach(async (to, from) => {
    const { isDelegatingAuthentication } = useEmbedMode()

    if (from && to.path === from.path && !hasContextRouteNameChanged(to, from)) {
      // note: except for the context route, query changes can never trigger re-init of the auth context
      return true
    }

    const authStore = useAuthStore()
    await authService.initializeContext(to)

    // Admin settings sanity: proactively trigger step-up if hitting the admin app root
    if (to.path === '/admin-settings' && !to.query.stepup) {
      try {
        const stepupKey = 'oc.stepup:admin-settings'
        const already = sessionStorage.getItem(stepupKey) === '1'
        if (!already && !new URLSearchParams(window.location.search).has('stepupAcr')) {
          const redirectUrl = to.fullPath + (to.fullPath.includes('?') ? '&' : '?') + 'stepup=1'
          sessionStorage.setItem(stepupKey, '1')
          console.info('[setupAuthGuard] admin step-up initiate', { redirectUrl })
          window.location.assign(`/?stepupAcr=advanced&redirectUrl=${encodeURIComponent(redirectUrl)}`)
          return false
        }
      } catch (e) {
        console.warn('[setupAuthGuard] admin step-up skipped', e)
      }
    }

    // vue-router currently (4.1.6) does not cancel navigations when a new one is triggered
    // we need to guard this case to be able to show the access denied page
    // and not be redirected to the login page
    if (authService.hasAuthErrorOccurred) {
      return to.name === 'accessDenied' || { name: 'accessDenied' }
    }

    if (isPublicLinkContextRequired(router, to)) {
      if (!authStore.publicLinkContextReady) {
        const publicLinkToken = extractPublicLinkToken(to)
        return {
          name: 'resolvePublicLink',
          params: { token: publicLinkToken },
          query: { redirectUrl: to.fullPath }
        }
      }
      return true
    }

    if (isUserContextRequired(router, to)) {
      if (!authStore.userContextReady) {
        if (unref(isDelegatingAuthentication)) {
          return { path: '/web-oidc-callback' }
        }

        return { path: '/login', query: { redirectUrl: to.fullPath } }
      }
      return true
    }

    if (isIdpContextRequired(router, to)) {
      if (!authStore.idpContextReady) {
        if (unref(isDelegatingAuthentication)) {
          return { path: '/web-oidc-callback' }
        }

        return { path: '/login', query: { redirectUrl: to.fullPath } }
      }
      return true
    }

    return true
  })
  router.afterEach((to) => {
    if (to.name !== 'accessDenied') {
      return
    }
    authService.hasAuthErrorOccurred = false
  })
}

export const hasContextRouteNameChanged = (to: RouteLocation, from: RouteLocation): boolean => {
  if (!to.query[contextRouteNameKey] && !from.query[contextRouteNameKey]) {
    return false
  }

  return (
    queryItemAsString(to.query[contextRouteNameKey]) !==
    queryItemAsString(from.query[contextRouteNameKey])
  )
}
