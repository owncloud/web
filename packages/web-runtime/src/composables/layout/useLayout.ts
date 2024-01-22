import LayoutPlain from '../../layouts/Plain.vue'
import LayoutApplication from '../../layouts/Application.vue'
import LayoutLoading from '../../layouts/Loading.vue'
import { isPublicLinkContextRequired, isUserContextRequired } from '../../router'
import { computed, unref } from 'vue'
import { Router } from 'vue-router'
import { useRouter, useAuthStore, AuthStore } from '@ownclouders/web-pkg'

export interface LayoutOptions {
  authStore?: AuthStore
  router?: Router
}

const layoutTypes = ['plain', 'loading', 'application'] as const
type LayoutType = (typeof layoutTypes)[number]

export const useLayout = (options?: LayoutOptions) => {
  const authStore = options?.authStore || useAuthStore()
  const router = options?.router || useRouter()

  const layoutType = computed<LayoutType>(() => {
    const plainLayoutRoutes = [
      'login',
      'logout',
      'oidcCallback',
      'oidcSilentRedirect',
      'resolvePublicLink',
      'accessDenied'
    ]
    if (
      !unref(router.currentRoute).name ||
      plainLayoutRoutes.includes(unref(router.currentRoute).name as string)
    ) {
      return 'plain'
    }
    if (isPublicLinkContextRequired(router, unref(router.currentRoute))) {
      return authStore.publicLinkContextReady ? 'application' : 'loading'
    }
    if (isUserContextRequired(router, unref(router.currentRoute))) {
      return authStore.userContextReady ? 'application' : 'loading'
    }
    return 'application'
  })

  const layout = computed(() => {
    switch (unref(layoutType)) {
      case 'application':
        return LayoutApplication
      case 'loading':
        return LayoutLoading
      case 'plain':
      default:
        return LayoutPlain
    }
  })

  return {
    layout
  }
}
