import { Module, Store } from 'vuex'
import { Router, RouteRecordRaw } from 'vue-router'
import { App, Component } from 'vue'
import { AppNavigationItem, ApplicationTranslations } from '@ownclouders/web-pkg'

/** shim configuration for now, should be typed in a later step */
export type RuntimeConfiguration = any

/** RuntimeApi defines the publicly available runtime api */
export interface RuntimeApi {
  announceRoutes: (routes: RouteRecordRaw[]) => void
  announceNavigationItems: (navigationItems: AppNavigationItem[]) => void
  announceTranslations: (appTranslations: ApplicationTranslations) => void
  announceStore: (applicationStore: Module<unknown, unknown>) => void
  announceExtension: (extension: { [key: string]: unknown }) => void
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
