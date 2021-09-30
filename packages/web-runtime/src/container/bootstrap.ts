import { registerClient } from '../services/clientRegistration'
import { RuntimeConfiguration } from './types'
import { buildApplication, NextApplication } from './application'
import { Store } from 'vuex'
import VueRouter from 'vue-router'
import { VueConstructor } from 'vue'
import { loadTheme } from '../helpers/theme'
import OwnCloud from 'owncloud-sdk'
import { sync as routerSync } from 'vuex-router-sync'
import getTextPlugin from 'vue-gettext'
import set from 'lodash-es/set'

/**
 * fetch runtime configuration, this step is optional, all later steps can use a static
 * configuration object as well
 *
 * @remarks
 * does not check if the configuration is valid, for now be careful until a schema is declared
 *
 * @param path - path to main configuration
 */
export const requestConfiguration = async (path: string): Promise<RuntimeConfiguration> => {
  const request = await fetch(path)
  if (request.status !== 200) {
    throw new Error(`config could not be loaded. HTTP status-code ${request.status}`)
  }

  return request.json().catch(error => {
    throw new Error(`config could not be parsed. ${error}`)
  })
}

/**
 * announce auth client to the runtime, currently only openIdConnect is supported here
 *
 * @remarks
 * if runtimeConfiguration does not ship any options for openIdConnect this step get skipped
 *
 * @param runtimeConfiguration
 */
export const announceClient = async (runtimeConfiguration: RuntimeConfiguration): Promise<void> => {
  const { openIdConnect = {} } = runtimeConfiguration

  if (!openIdConnect.dynamic) {
    return
  }

  const { client_id: clientId, client_secret: clientSecret } = await registerClient(openIdConnect)
  openIdConnect.client_id = clientId
  openIdConnect.client_secret = clientSecret
}

/**
 * announce applications to the runtime, it takes care that all requirements are fulfilled and then:
 * - bulk build all applications
 * - bulk register all applications, no other application is guaranteed to be registered here, don't request one
 * - bulk activate all applications, all applications are registered, it's safe to request a application api here
 *
 * @param runtimeConfiguration
 * @param store
 * @param router
 * @param translations
 * @param supportedLanguages
 */
export const announceApplications = async ({
  runtimeConfiguration,
  store,
  router,
  translations,
  supportedLanguages
}: {
  runtimeConfiguration: RuntimeConfiguration
  store: Store<unknown>
  router: VueRouter
  translations: unknown
  supportedLanguages: { [key: string]: string }
}): Promise<void> => {
  const {
    apps: internalApplications = [],
    external_apps: externalApplications = []
  } = runtimeConfiguration

  const applicationPaths = [
    ...internalApplications.map(application => `web-app-${application}`),
    ...externalApplications.map(application => application.path)
  ].filter(Boolean)

  const applicationResults = await Promise.allSettled(
    applicationPaths.map(applicationPath =>
      buildApplication({
        applicationPath,
        store,
        supportedLanguages,
        router,
        translations
      })
    )
  )

  const applications = applicationResults.reduce<NextApplication[]>((acc, applicationResult) => {
    // we don't want to fail hard with the full system when one specific application can't get loaded. only log the error.
    if (applicationResult.status !== 'fulfilled') {
      console.error(applicationResult.reason)
    } else {
      acc.push(applicationResult.value)
    }

    return acc
  }, [])

  await Promise.all(applications.map(application => application.initialize()))
  await Promise.all(applications.map(application => application.ready()))
}

/**
 * announce runtime theme to the runtime, this also takes care that the store
 * and designSystem has all needed information to render the customized ui
 *
 * @param themeLocation
 * @param store
 * @param vue
 * @param designSystem
 */
export const announceTheme = async ({
  store,
  vue,
  designSystem,
  runtimeConfiguration
}: {
  store: Store<unknown>
  vue: VueConstructor
  designSystem: any
  runtimeConfiguration?: RuntimeConfiguration
}): Promise<void> => {
  const { theme } = await loadTheme(runtimeConfiguration.theme)
  await store.dispatch('loadTheme', { theme: theme.default })

  vue.use(designSystem, {
    tokens: store.getters.theme.designTokens
  })
}

/**
 * announce runtime translations by injecting them into the getTextPlugin
 *
 * @param vue
 * @param supportedLanguages
 * @param translations
 */
export const announceTranslations = ({
  vue,
  supportedLanguages,
  translations
}: {
  vue: VueConstructor
  supportedLanguages: unknown
  translations: unknown
}): void => {
  vue.use(getTextPlugin, {
    availableLanguages: supportedLanguages,
    defaultLanguage: navigator.language.substring(0, 2),
    translations,
    silent: true
  })
}

/**
 * announce owncloud SDK and inject it into vue
 *
 * @param vue
 * @param runtimeConfiguration
 */
export const announceOwncloudSDK = ({
  vue,
  runtimeConfiguration
}: {
  vue: VueConstructor
  runtimeConfiguration: RuntimeConfiguration
}): void => {
  const sdk = new OwnCloud()
  sdk.init({ baseUrl: runtimeConfiguration.server || window.location.origin })
  vue.prototype.$client = sdk
}

/**
 * announce runtime defaults, this is usual the last needed announcement before rendering the actual ui
 *
 * @param vue
 * @param runtimeConfiguration
 * @param store
 * @param router
 */
export const announceDefaults = async ({
  vue,
  runtimeConfiguration,
  store,
  router
}: {
  vue: VueConstructor
  runtimeConfiguration: RuntimeConfiguration
  store: Store<unknown>
  router: VueRouter
}): Promise<void> => {
  // set home route
  const appIds = store.getters.appIds
  let defaultExtensionId = store.getters.configuration.options.defaultExtension
  if (!defaultExtensionId || appIds.indexOf(defaultExtensionId) < 0) {
    defaultExtensionId = appIds[0]
  }

  router.addRoutes([
    { path: '/', redirect: () => store.getters.getNavItemsByExtension(defaultExtensionId)[0].route }
  ])

  routerSync(store, router)

  // inject custom config into vuex
  await store.dispatch('loadConfig', runtimeConfiguration)

  /**
   * TODO: Find a different way to access store from withit JS files
   * potential options are:
   * - use the api which already is in place but deprecated
   * - use a global object
   *
   * at the moment it is not clear if this api should be exposed or not.
   * we need to decide if we extend the api more or just expose the store and de deprecate
   * the apis for retrieving it.
   */
  set(vue, '$store', store)

  return Promise.resolve(undefined)
}
