import { Store } from 'vuex'
import VueRouter, { RouteConfig } from 'vue-router'
import Vue, { Component } from 'vue'

/** shim configuration for now, should be typed in a later step */
export type RuntimeConfiguration = any

/** ApplicationInformation describes required information of an application */
export interface ApplicationInformation {
  id?: string
  name?: string
  icon?: string
  isFileEditor?: boolean
  extensions?: any[]
  fileSideBars?: any[]
}

/**
 * ApplicationNavigationItem describes an application navigation item.
 * an example use for this is the registration of application specific navigation items in the runtime
 */
export interface ApplicationNavigationItem {
  name?: string
  iconMaterial?: string
  route?: {
    name?: string
    path?: string
  }
}

/**
 * ApplicationQuickAction describes an application action that is used in the runtime.
 *
 * @deprecated In the future quick actions should be registered just like any other extension. Fine
 * to use this interface for now, but it will be changed in the near future.
 */
export interface ApplicationQuickAction {
  id?: string
  label?: string
  icon?: string
  handler?: () => Promise<void>
  displayed?: boolean
}

/**
 * ApplicationQuickActions describes a map of application actions that are used in the runtime
 *
 * @deprecated In the future quick actions should be registered just like any other extension. Fine
 * to use this interface for now, but it will be changed in the near future.
 */
export interface ApplicationQuickActions {
  [key: string]: ApplicationQuickAction
}

/**
 * ApplicationTranslations is a map of language keys to translations
 */
export interface ApplicationTranslations {
  [lang: string]: {
    key: string
  }
}

/** ClassicApplicationScript reflects classic application script structure */
export interface ClassicApplicationScript {
  appInfo?: ApplicationInformation
  store?: Store<any>
  routes?: RouteConfig[]
  navItems?: ApplicationNavigationItem[]
  quickActions?: ApplicationQuickActions
  translations?: ApplicationTranslations
  initialize?: () => void
  ready?: () => void
  mounted?: () => void
}

/** RuntimeApi defines the publicly available runtime api */
export interface RuntimeApi {
  announceRoutes: (routes: RouteConfig[]) => void
  announceNavigationItems: (navigationItems: ApplicationNavigationItem[]) => void
  announceTranslations: (appTranslations: ApplicationTranslations) => void
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
