import { Store } from 'vuex'
import VueRouter, { RouteConfig } from 'vue-router'
import Vue, { Component } from 'vue'

/** shim configuration for now, should be typed in a later step */
export type RuntimeConfiguration = any

/** application information describes needed information from a application */
export interface ApplicationInformation {
  id?: string
  name?: string
  icon?: string
  isFileEditor?: boolean
  extensions?: any[]
  fileSideBars?: any[]
}

/**
 * application navigation item describes a application navigation item.
 * a example use for this is the registration of application specific navigation items in the runtime
 */
export interface ApplicationNavigationItem {
  name?: string
  iconMaterial?: string
  route?: {
    name?: string
    path?: string
  }
}

/** application quick action describes a application action that is used in the runtime */
export interface ApplicationQuickActions {
  [key: string]: {
    id?: string
    label?: string
    icon?: string
    handler?: () => Promise<void>
    displayed?: boolean
  }
}

/** reflects classic application script structure */
export interface ClassicApplicationScript {
  appInfo?: ApplicationInformation
  store?: Store<any>
  routes?: RouteConfig[]
  navItems?: ApplicationNavigationItem[]
  quickActions?: ApplicationQuickActions
  translations?: unknown
  ready?: () => void
  mounted?: () => void
}

/** definition of public available runtime api */
export interface RuntimeApi {
  announceRoutes: (routes: RouteConfig[]) => void
  announceNavigationItems: (navigationItems: ApplicationNavigationItem[]) => void
  announceTranslations: (appTranslations: unknown) => void
  announceQuickActions: (quickActions: ApplicationQuickActions) => void
  announceStore: (applicationStore: Store<unknown>) => void
  announceExtension: (extension: { [key: string]: unknown }) => void
  requestStore: () => Store<unknown>
  requestRouter: () => VueRouter
  openPortal: (
    instance: typeof Vue.prototype,
    toApp: string,
    toPortal: string,
    order: number,
    components: Component[]
  ) => void
}
