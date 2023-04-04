import { App, ComponentCustomProperties } from 'vue'
import { RouteLocationRaw, Router } from 'vue-router'
import { Store } from 'vuex'

export interface AppReadyHookArgs {
  announceExtension: (extension: { [key: string]: unknown }) => void
  globalProperties: ComponentCustomProperties & Record<string, any>
  router: Router
  store: Store<unknown>
  instance?: App
  portal?: any
}

export interface AppNavigationItem {
  activeFor?: { name?: string; path?: string }[]
  enabled?: (capabilities?: Record<string, any>) => boolean
  fillType?: string
  icon?: string
  name?: string | ((capabilities?: Record<string, any>) => string)
  route?: RouteLocationRaw
  tag?: string
}
