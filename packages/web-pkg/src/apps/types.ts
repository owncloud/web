import { App, ComponentCustomProperties, Ref } from 'vue'
import { RouteLocationRaw, Router, RouteRecordRaw } from 'vue-router'
import { Store } from 'vuex'
import { Extension } from 'web-pkg/src/composables/piniaStores'

export interface AppReadyHookArgs {
  announceExtension: (extension: { [key: string]: unknown }) => void
  globalProperties: ComponentCustomProperties & Record<string, any>
  router: Router
  store: Store<unknown>
  instance?: App
  portal?: any
}

export interface AppNavigationItem {
  isActive?: () => boolean
  activeFor?: { name?: string; path?: string }[]
  enabled?: (capabilities?: Record<string, any>) => boolean
  fillType?: string
  icon?: string
  name?: string | ((capabilities?: Record<string, any>) => string)
  route?: RouteLocationRaw
  tag?: string
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

export type AppConfigObject = Record<string, any>

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
 * ApplicationTranslations is a map of language keys to translations
 */
export interface ApplicationTranslations {
  [lang: string]: {
    [key: string]: string
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
  extensions?: Ref<Extension[]>
  initialize?: () => void
  ready?: () => void
  mounted?: () => void
  // TODO: move this to its own type
  setup?: (args: { applicationConfig: AppConfigObject }) => ClassicApplicationScript
}

export type ApplicationSetupOptions = { applicationConfig: AppConfigObject }

export const defineWebApplication = (args: {
  setup: (options: ApplicationSetupOptions) => ClassicApplicationScript
}) => {
  return args
}
