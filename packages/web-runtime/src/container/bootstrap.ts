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
import { getBackendVersion, getWebVersion } from './versions'
import { useLocalStorage } from 'web-pkg/src/composables'
import { unref } from '@vue/composition-api'
import { useDefaultThemeName } from '../composables'
import { clientService } from 'web-pkg/src/services'
import { UppyService } from '../services/uppyService'

import { init as SentryInit } from '@sentry/browser'
import { Vue as SentryVueIntegration } from '@sentry/integrations'

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

  return request.json().catch((error) => {
    throw new Error(`config could not be parsed. ${error}`)
  })
}

/**
 * Announce and prepare vuex store with data that is needed before any application gets announced.
 *
 * @param vue
 * @param runtimeConfiguration
 * @param store
 */
export const announceStore = async ({
  vue,
  runtimeConfiguration,
  store
}: {
  vue: VueConstructor
  runtimeConfiguration: RuntimeConfiguration
  store: Store<any>
}): Promise<void> => {
  await store.dispatch('loadConfig', runtimeConfiguration)
  await store.dispatch('initAuth')

  /**
   * TODO: Find a different way to access store from within JS files
   * potential options are:
   * - use the api which already is in place but deprecated
   * - use a global object
   *
   * at the moment it is not clear if this api should be exposed or not.
   * we need to decide if we extend the api more or just expose the store and de deprecate
   * the apis for retrieving it.
   */
  set(vue, '$store', store)
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
  const { apps: internalApplications = [], external_apps: externalApplications = [] } =
    rewriteDeprecatedAppNames(runtimeConfiguration)

  const applicationPaths = [
    ...internalApplications.map((application) => `web-app-${application}`),
    ...externalApplications.map((application) => application.path)
  ].filter(Boolean)

  const applicationResults = await Promise.allSettled(
    applicationPaths.map((applicationPath) =>
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

  await Promise.all(applications.map((application) => application.initialize()))
  await Promise.all(applications.map((application) => application.ready()))
}

/**
 * Rewrites old names of renamed apps to their new name and prints a warning to adjust configuration to the respective new app name.
 *
 * @param {RuntimeConfiguration} runtimeConfiguration
 */
const rewriteDeprecatedAppNames = (
  runtimeConfiguration: RuntimeConfiguration
): RuntimeConfiguration => {
  const appAliases = [
    { name: 'preview', oldName: 'media-viewer' },
    { name: 'text-editor', oldName: 'markdown-editor' }
  ]
  return {
    ...runtimeConfiguration,
    apps: runtimeConfiguration.apps.map((appName) => {
      const appAlias = appAliases.find((appAlias) => appAlias.oldName === appName)
      if (appAlias) {
        console.warn(`app "${appAlias.oldName}" has been renamed, use "${appAlias.name}" instead.`)
        return appAlias.name
      }
      return appName
    })
  }
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
  const { theme } = await loadTheme(runtimeConfiguration?.theme)
  await store.dispatch('loadThemes', { theme })
  const currentThemeName = useLocalStorage('oc_currentThemeName', null) // note: use null as default so that we can fall back to system preferences
  if (unref(currentThemeName) === null) {
    currentThemeName.value = useDefaultThemeName()
  }
  await store.dispatch('loadTheme', { theme: theme[unref(currentThemeName)] || theme.default })

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
 * announce clientService and owncloud SDK and inject it into vue
 *
 * @param vue
 * @param runtimeConfiguration
 */
export const announceClientService = ({
  vue,
  runtimeConfiguration
}: {
  vue: VueConstructor
  runtimeConfiguration: RuntimeConfiguration
}): void => {
  const sdk = new OwnCloud()
  sdk.init({ baseUrl: runtimeConfiguration.server || window.location.origin })
  vue.prototype.$client = sdk
  vue.prototype.$clientService = clientService
  vue.prototype.$clientService.owncloudSdk = sdk
}

/**
 * announce uppyService and inject it into vue
 *
 * @param vue
 */
export const announceUppyService = ({ vue }: { vue: VueConstructor }): void => {
  vue.prototype.$uppyService = new UppyService()
}

/**
 * announce runtime defaults, this is usual the last needed announcement before rendering the actual ui
 *
 * @param vue
 * @param store
 * @param router
 */
export const announceDefaults = ({
  store,
  router
}: {
  store: Store<unknown>
  router: VueRouter
}): void => {
  // set home route
  const appIds = store.getters.appIds
  let defaultExtensionId = store.getters.configuration.options.defaultExtension
  if (!defaultExtensionId || appIds.indexOf(defaultExtensionId) < 0) {
    defaultExtensionId = appIds[0]
  }

  const route = store.getters.getNavItemsByExtension(defaultExtensionId)[0]?.route
  if (route) {
    router.addRoute({
      path: '/',
      redirect: () => route
    })
  }

  routerSync(store, router)
}

/**
 * announce some version numbers
 *
 * @param store
 */
export const announceVersions = ({ store }: { store: Store<unknown> }): void => {
  const versions = [getWebVersion(), getBackendVersion({ store })].filter(Boolean)
  versions.forEach((version) => {
    console.log(
      `%c ${version} `,
      'background-color: #041E42; color: #FFFFFF; font-weight: bold; border: 1px solid #FFFFFF; padding: 5px;'
    )
  })
}

/**
 * starts the sentry monitor
 *
 * @remarks
 * if runtimeConfiguration does not contain dsn sentry will not be started
 *
 * @param runtimeConfiguration
 */
export const startSentry = (
  runtimeConfiguration: RuntimeConfiguration,
  Vue: VueConstructor
): void => {
  if (runtimeConfiguration.sentry?.dsn) {
    const { dsn, environment = 'production', ...moreSentryOptions } = runtimeConfiguration.sentry

    SentryInit({
      dsn,
      environment,
      integrations: [new SentryVueIntegration({ Vue, attachProps: true, logErrors: true })],
      ...moreSentryOptions
    })
  }
}
