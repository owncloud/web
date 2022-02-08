import VueRouter, { RouteConfig } from 'vue-router'
import clone from 'lodash-es/clone'
import {
  RuntimeApi,
  ApplicationNavigationItem,
  ApplicationQuickActions,
  ApplicationTranslations
} from './types'
import { ApiError } from './error'
import { get, isEqual, isObject, isArray } from 'lodash-es'
import { Store } from 'vuex'
import Vue, { Component } from 'vue'
import { Wormhole } from 'portal-vue'

/**
 * inject application specific routes into runtime
 *
 * @param applicationId
 * @param router
 * @param routes
 */
const announceRoutes = (applicationId: string, router: VueRouter, routes: RouteConfig[]): void => {
  if (!isArray(routes)) {
    throw new ApiError("routes can't be blank")
  }
  const namespaceRouteName = (name: string) => {
    return name.startsWith(`${applicationId}-`) ? name : `${applicationId}-${name}`
  }
  routes
    .map((applicationRoute) => {
      if (!isObject(applicationRoute)) {
        throw new ApiError("route can't be blank", applicationRoute)
      }

      const route = clone(applicationRoute)
      if (route.name) {
        route.name = applicationId === route.name ? route.name : namespaceRouteName(route.name)
      }

      route.path = `/${encodeURI(applicationId)}${route.path}`

      if (route.children) {
        route.children = route.children.map((childRoute) => {
          if (!isObject(applicationRoute)) {
            throw new ApiError("route children can't be blank", applicationRoute, childRoute)
          }

          const r = clone(childRoute)
          if (childRoute.name) {
            r.name = namespaceRouteName(childRoute.name)
          }
          return r
        })
      }

      return route
    })
    .forEach((route) => {
      router.addRoute(route)
    })
}

/**
 * inject application specific navigation items into runtime
 *
 * @param applicationId
 * @param store
 * @param navigationItems
 */
const announceNavigationItems = (
  applicationId: string,
  store: Store<unknown>,
  navigationItems: ApplicationNavigationItem[]
): void => {
  if (!isObject(navigationItems)) {
    throw new ApiError("navigationItems can't be blank")
  }

  store.commit('SET_NAV_ITEMS_FROM_CONFIG', {
    extension: applicationId,
    navItems: navigationItems
  })
}

/**
 * inject application specific extension into runtime
 *
 * @param applicationId
 * @param store
 * @param extension
 */
const announceExtension = (
  applicationId: string,
  store: Store<unknown>,
  extension: { [key: string]: unknown }
): void => {
  store.commit('REGISTER_EXTENSION', { app: applicationId, extension })
}

/**
 * inject application specific translations into runtime
 *
 * @param translations
 * @param appTranslations
 * @param supportedLanguages
 */
const announceTranslations = (
  supportedLanguages: { [key: string]: string },
  translations: unknown,
  appTranslations: ApplicationTranslations
): void => {
  if (!isObject(translations)) {
    throw new ApiError("translations can't be blank")
  }

  Object.keys(supportedLanguages).forEach((lang) => {
    if (translations[lang] && appTranslations[lang]) {
      Object.assign(translations[lang], appTranslations[lang])
    }
  })
}

/**
 * inject application specific quickActions into runtime
 *
 * @param store
 * @param quickActions
 */
const announceQuickActions = (
  store: Store<unknown>,
  quickActions: ApplicationQuickActions
): void => {
  if (!isObject(quickActions)) {
    throw new ApiError("quickActions can't be blank")
  }

  store.commit('ADD_QUICK_ACTIONS', quickActions)
}

/**
 * inject application specific store into runtime
 *
 * @param applicationName
 * @param store
 * @param applicationStore
 */
const announceStore = (
  applicationName: string,
  store: Store<unknown>,
  applicationStore: unknown
): void => {
  const obtainedStore: Store<unknown> = get(applicationStore, 'default', applicationStore)

  if (!isObject(obtainedStore)) {
    throw new ApiError("store can't be blank")
  }

  store.registerModule(applicationName, obtainedStore)
}

/**
 * open a wormhole portal, this wraps vue-portal
 *
 * @param instance
 * @param applicationId
 * @param toApp
 * @param toPortal
 * @param order
 * @param components
 */
const openPortal = (
  applicationId: string,
  instance: typeof Vue.prototype,
  toApp: string,
  toPortal: string,
  order: number,
  components: Component[]
): void => {
  Wormhole.open({
    to: ['app', toApp, toPortal].filter(Boolean).join('.'),
    from: ['app', applicationId, toPortal, order].filter(Boolean).join('.'),
    order: order,
    passengers: components.map(instance.$createElement)
  })
}

/**
 * expose store to the application
 *
 * @deprecated use with caution
 *
 * @param store
 */
const requestStore = (store: Store<unknown>): Store<unknown> => {
  if (isEqual(process.env.NODE_ENV, 'development')) {
    console.warn('requestStore // store api is deprecated, use with caution')
  }

  return store
}

/**
 * expose router to the application
 *
 * @deprecated use with caution
 *
 * @param router
 */
const requestRouter = (router: VueRouter): VueRouter => {
  if (isEqual(process.env.NODE_ENV, 'development')) {
    console.warn('requestRouter // router api is deprecated, use with caution')
  }

  return router
}

/**
 * exposed runtime api, this wraps all available api actions in a closure and provides application
 * specific data to the implementations.
 *
 * each application get its own provisioned api!
 *
 * @param applicationName
 * @param applicationId
 * @param store
 * @param router
 * @param translations
 * @param supportedLanguages
 */
export const buildRuntimeApi = ({
  applicationName,
  applicationId,
  store,
  router,
  translations,
  supportedLanguages
}: {
  applicationName: string
  applicationId: string
  store: Store<unknown>
  translations: unknown
  router: VueRouter
  supportedLanguages: { [key: string]: string }
}): RuntimeApi => {
  if (!applicationName) {
    throw new ApiError("applicationName can't be blank")
  }

  if (!applicationId) {
    throw new ApiError("applicationId can't be blank")
  }

  return {
    announceRoutes: (routes: RouteConfig[]): void => announceRoutes(applicationId, router, routes),
    announceNavigationItems: (navigationItems: ApplicationNavigationItem[]): void =>
      announceNavigationItems(applicationId, store, navigationItems),
    announceTranslations: (appTranslations: ApplicationTranslations): void =>
      announceTranslations(supportedLanguages, translations, appTranslations),
    announceQuickActions: (quickActions: ApplicationQuickActions): void =>
      announceQuickActions(store, quickActions),
    announceStore: (applicationStore: Store<unknown>): void =>
      announceStore(applicationName, store, applicationStore),
    announceExtension: (extension: { [key: string]: unknown }): void =>
      announceExtension(applicationId, store, extension),
    requestStore: (): Store<unknown> => requestStore(store),
    requestRouter: (): VueRouter => requestRouter(router),
    openPortal: (
      instance: typeof Vue.prototype,
      toApp: string,
      toPortal: string,
      order: number,
      components: Component[]
    ): void => openPortal(applicationId, instance, toApp, toPortal, order, components)
  }
}
