import { Store } from 'vuex'
import { RouteRecordRaw, Router } from 'vue-router'
import { App, Component } from 'vue'
import { AppNavigationItem } from 'web-pkg/src/apps'

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
  routes?: ((...args) => RouteRecordRaw[]) | RouteRecordRaw[]
  navItems?: ((...args) => AppNavigationItem[]) | AppNavigationItem[]
  quickActions?: ApplicationQuickActions
  translations?: ApplicationTranslations
  initialize?: () => void
  ready?: () => void
  mounted?: () => void
}

/** RuntimeApi defines the publicly available runtime api */
export interface RuntimeApi {
  announceRoutes: (routes: RouteRecordRaw[]) => void
  announceNavigationItems: (navigationItems: AppNavigationItem[]) => void
  announceTranslations: (appTranslations: ApplicationTranslations) => void
  announceQuickActions: (quickActions: ApplicationQuickActions) => void
  announceStore: (applicationStore: Store<unknown>) => void
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
