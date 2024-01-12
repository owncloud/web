import { Module, Store } from 'vuex'
import { Router, RouteRecordRaw } from 'vue-router'
import { App, Component } from 'vue'
import { AppNavigationItem, ApplicationTranslations } from '@ownclouders/web-pkg'

/** RuntimeApi defines the publicly available runtime api */
export interface RuntimeApi {
  announceRoutes: (routes: RouteRecordRaw[]) => void
  announceNavigationItems: (navigationItems: AppNavigationItem[]) => void
  announceTranslations: (appTranslations: ApplicationTranslations) => void
  announceStore: (applicationStore: Module<unknown, unknown>) => void
  requestStore: () => Store<unknown>
  requestRouter: () => Router
  openPortal: (
    instance: App,
    toApp: string,
    toPortal: string,
    order: number,
    components: Component[]
  ) => void
}
