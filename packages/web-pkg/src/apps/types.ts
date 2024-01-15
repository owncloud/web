import { App, ComponentCustomProperties, Ref } from 'vue'
import { RouteLocationRaw, Router, RouteRecordRaw } from 'vue-router'
import { Module, Store } from 'vuex'
import { Extension } from '../composables/piniaStores'
import { IconFillType } from '../helpers'

export interface AppReadyHookArgs {
  globalProperties: ComponentCustomProperties & Record<string, any>
  router: Router
  store: Store<unknown>
  instance?: App
  portal?: any
}

export interface AppNavigationItem {
  isActive?: () => boolean
  activeFor?: { name?: string; path?: string }[]
  enabled?: () => boolean
  fillType?: string
  icon?: string
  name?: string | (() => string)
  route?: RouteLocationRaw
  tag?: string
  handler?: () => void
  priority?: number
}

/**
 * ApplicationQuickAction describes an application action that is used in the runtime.
 *
 * @deprecated Quick actions should be registered as extension via the `files.quick-action` scope.
 */
export interface ApplicationQuickAction {
  id?: string
  label?: (...args) => string | string
  icon?: string
  iconFillType?: string
  handler?: (...args) => Promise<void> | void
  displayed?: (...args) => boolean | boolean
}

export type AppConfigObject = Record<string, any>

export interface ApplicationMenuItem {
  enabled: () => boolean
  priority?: number
  openAsEditor?: boolean
}

export interface ApplicationFileExtension {
  app?: string
  extension?: string
  handler?: (...args) => Promise<void> | void
  hasPriority?: boolean
  label?: string
  mimeType?: string
  newFileMenu?: { menuTitle: () => string }
  routeName?: string
}

/** ApplicationInformation describes required information of an application */
export interface ApplicationInformation {
  color?: string
  id?: string
  name?: string
  icon?: string
  iconFillType?: IconFillType
  iconColor?: string
  img?: string
  isFileEditor?: boolean
  extensions?: ApplicationFileExtension[]
  defaultExtension?: string
  applicationMenu?: ApplicationMenuItem
}

/**
 * ApplicationTranslations is a map of language keys to translations
 */
export interface ApplicationTranslations {
  [lang: string]: {
    [key: string]: string | string[]
  }
}

/** ClassicApplicationScript reflects classic application script structure */
export interface ClassicApplicationScript {
  appInfo?: ApplicationInformation
  store?: Module<unknown, unknown>
  routes?: ((...args) => RouteRecordRaw[]) | RouteRecordRaw[]
  navItems?: ((...args) => AppNavigationItem[]) | AppNavigationItem[]
  translations?: ApplicationTranslations
  extensions?: Ref<Extension[]>
  initialize?: () => void
  ready?: (args: AppReadyHookArgs) => void
  mounted?: (...args) => void
  // TODO: move this to its own type
  setup?: (args: { applicationConfig: AppConfigObject }) => ClassicApplicationScript
}

export type ApplicationSetupOptions = { applicationConfig: AppConfigObject }

export const defineWebApplication = (args: {
  setup: (options: ApplicationSetupOptions) => ClassicApplicationScript
}) => {
  return args
}
