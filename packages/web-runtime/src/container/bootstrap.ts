import { registerClient } from '../services/clientRegistration'
import { RuntimeConfiguration } from './types'
import { buildApplication, NextApplication } from './application'
import { Store } from 'vuex'
import { Router } from 'vue-router'
import { App, computed } from 'vue'
import { loadTheme } from '../helpers/theme'
import OwnCloud from 'owncloud-sdk'
import { createGettext, GetTextOptions, Language } from 'vue3-gettext'
import { getBackendVersion, getWebVersion } from './versions'
import {
  useModals,
  useThemeStore,
  useUserStore,
  UserStore,
  useMessages
} from '@ownclouders/web-pkg'
import { authService } from '../services/auth'
import {
  ClientService,
  LoadingService,
  PasswordPolicyService,
  PreviewService,
  UppyService
} from '@ownclouders/web-pkg'
import { default as storeOptions } from '../store'
import { init as sentryInit } from '@sentry/vue'
import { configurationManager, RawConfig, ConfigurationManager } from '@ownclouders/web-pkg'
import { webdav } from '@ownclouders/web-client/src/webdav'
import { v4 as uuidV4 } from 'uuid'
import { merge } from 'lodash-es'
import {
  AppConfigObject,
  resourceIconMappingInjectionKey,
  ResourceIconMapping
} from '@ownclouders/web-pkg'
import { MESSAGE_TYPE } from '@ownclouders/web-client/src/sse'
import { getQueryParam } from '../helpers/url'
import { z } from 'zod'
import { Resource } from '@ownclouders/web-client'
import PQueue from 'p-queue'
import { extractNodeId, extractStorageId } from '@ownclouders/web-client/src/helpers'
import { storeToRefs } from 'pinia'

const getEmbedConfigFromQuery = (
  doesEmbedEnabledOptionExists: boolean
): RawConfig['options']['embed'] => {
  const config: RawConfig['options']['embed'] = {}

  if (!doesEmbedEnabledOptionExists) {
    config.enabled = getQueryParam('embed') === 'true'
  }

  // Can enable location picker in embed mode
  const embedTarget = getQueryParam('embed-target')

  if (embedTarget) {
    config.target = embedTarget
  }

  const delegateAuthentication = getQueryParam('embed-delegate-authentication')

  if (delegateAuthentication) {
    config.delegateAuthentication = delegateAuthentication === 'true'
  }

  const delegateAuthenticationOrigin = getQueryParam('embed-delegate-authentication-origin')

  if (delegateAuthentication) {
    config.delegateAuthenticationOrigin = delegateAuthenticationOrigin
  }

  return config
}

/**
 * fetch runtime configuration, this step is optional, all later steps can use a static
 * configuration object as well
 *
 * @remarks
 * does not check if the configuration is valid, for now be careful until a schema is declared
 *
 * @param path - path to main configuration
 */
export const announceConfiguration = async (path: string): Promise<RuntimeConfiguration> => {
  const request = await fetch(path, { headers: { 'X-Request-ID': uuidV4() } })
  if (request.status !== 200) {
    throw new Error(`config could not be loaded. HTTP status-code ${request.status}`)
  }

  const rawConfig = (await request.json().catch((error) => {
    throw new Error(`config could not be parsed. ${error}`)
  })) as RawConfig

  const embedConfigFromQuery = getEmbedConfigFromQuery(
    rawConfig.options?.embed &&
      Object.prototype.hasOwnProperty.call(rawConfig.options.embed, 'enabled')
  )

  rawConfig.options = {
    ...rawConfig.options,
    embed: { ...rawConfig.options?.embed, ...embedConfigFromQuery }
  }

  configurationManager.initialize(rawConfig)
  // TODO: we might want to get rid of exposing the raw config. needs more refactoring though.
  return rawConfig
}

/**
 * Announce and prepare vuex store with data that is needed before any application gets announced.
 *
 * @param vue
 * @param runtimeConfiguration
 * @param language
 */
export const announceStore = async ({
  runtimeConfiguration
}: {
  runtimeConfiguration: RuntimeConfiguration
}): Promise<any> => {
  const store = new Store({ ...storeOptions })
  await store.dispatch('loadConfig', runtimeConfiguration)

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
  ;(window as any).__$store = store
  return store
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
 *
 * @param app
 * @param runtimeConfiguration
 * @param store
 * @param router
 * @param translations
 * @param supportedLanguages
 */
export const initializeApplications = async ({
  app,
  runtimeConfiguration,
  configurationManager,
  store,
  router,
  gettext,
  supportedLanguages
}: {
  app: App
  runtimeConfiguration: RuntimeConfiguration
  configurationManager: ConfigurationManager
  store: Store<unknown>
  router: Router
  gettext: Language
  supportedLanguages: { [key: string]: string }
}): Promise<NextApplication[]> => {
  const { apps: internalApplications = [], external_apps: externalApplications = [] } =
    rewriteDeprecatedAppNames(runtimeConfiguration)

  type RawApplication = {
    path: string
    config?: AppConfigObject
  }

  const rawApplications: RawApplication[] = [
    ...internalApplications.map((application) => ({
      path: `web-app-${application}`
    })),
    ...externalApplications
  ]

  const applicationResults = await Promise.allSettled(
    rawApplications.map((rawApplication) =>
      buildApplication({
        app,
        applicationPath: rawApplication.path,
        applicationConfig: rawApplication.config,
        store,
        supportedLanguages,
        router,
        gettext,
        configurationManager
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

  return applications
}

/**
 * Bulk activate all applications, all applications are registered, it's safe to request a application api here
 *
 * @param applications
 */
export const announceApplicationsReady = async ({
  app,
  store,
  applications
}: {
  app: App
  store: Store<any>
  applications: NextApplication[]
}): Promise<void> => {
  await Promise.all(applications.map((application) => application.ready()))
  const apps = store.state.apps

  const mapping: ResourceIconMapping = {
    mimeType: {},
    extension: {}
  }

  ;(apps.fileEditors as any[]).forEach((editor) => {
    const meta = apps.meta[editor.app]

    const getIconDefinition = () => {
      return {
        name: meta.icon,
        ...(meta.iconFillType && {
          fillType: meta.iconFillType
        }),
        ...(meta.iconColor && {
          color: meta.iconColor
        })
      }
    }

    if (editor.mimeType) {
      mapping.mimeType[editor.mimeType] = getIconDefinition()
    }

    if (editor.extension) {
      mapping.extension[editor.extension] = getIconDefinition()
    }
  })

  app.provide(resourceIconMappingInjectionKey, mapping)
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
  app,
  designSystem,
  runtimeConfiguration
}: {
  app: App
  designSystem: any
  runtimeConfiguration?: RuntimeConfiguration
}): Promise<void> => {
  const themeStore = useThemeStore()
  const { initializeThemes } = themeStore
  const { currentTheme } = storeToRefs(themeStore)

  const webTheme = await loadTheme(runtimeConfiguration?.theme)

  await initializeThemes(webTheme)

  app.use(designSystem, {
    tokens: currentTheme.value.designTokens
  })
}

export const announcePiniaStores = () => {
  const messagesStore = useMessages()
  const modalStore = useModals()
  const userStore = useUserStore()
  return { messagesStore, modalStore, userStore }
}

/**
 * announce runtime translations by injecting them into the getTextPlugin
 *
 * @param vue
 * @param options
 */
export const announceTranslations = ({
  app,
  ...options
}: {
  app: App
} & Partial<GetTextOptions>): Language => {
  const gettext = createGettext({
    defaultLanguage: navigator.language.substring(0, 2),
    silent: true,
    ...options
  })
  app.use(gettext)
  return gettext
}

export const announceAdditionalTranslations = ({
  gettext,
  translations
}: { gettext: Language } & Pick<GetTextOptions, 'translations'>): void => {
  gettext.translations = merge(gettext.translations, translations)
}

/**
 * announce clientService and owncloud SDK and inject it into vue
 *
 * @param vue
 * @param runtimeConfiguration
 * @param configurationManager
 * @param store
 */
export const announceClientService = ({
  app,
  runtimeConfiguration,
  configurationManager,
  store,
  userStore
}: {
  app: App
  runtimeConfiguration: RuntimeConfiguration
  configurationManager: ConfigurationManager
  store: Store<any>
  userStore: UserStore
}): void => {
  const sdk = new OwnCloud()
  sdk.init({ baseUrl: runtimeConfiguration.server || window.location.origin })
  const clientService = new ClientService({
    configurationManager,
    language: app.config.globalProperties.$language,
    store
  })
  app.config.globalProperties.$client = sdk
  app.config.globalProperties.$clientService = clientService
  app.config.globalProperties.$clientService.owncloudSdk = sdk
  app.config.globalProperties.$clientService.webdav = webdav({
    sdk,
    accessToken: computed(() => store.getters['runtime/auth/accessToken']),
    baseUrl: runtimeConfiguration.server,
    capabilities: computed(() => store.getters.capabilities),
    clientService: app.config.globalProperties.$clientService,
    language: computed(() => app.config.globalProperties.$language.current),
    user: computed(() => userStore.user)
  })

  app.provide('$client', sdk)
  app.provide('$clientService', clientService)
}

/**
 * @param vue
 */
export const announceLoadingService = ({ app }: { app: App }): void => {
  const loadingService = new LoadingService()
  app.config.globalProperties.$loadingService = loadingService
  app.provide('$loadingService', loadingService)
}

/**
 * announce uppyService and inject it into vue
 *
 * @param vue
 */
export const announceUppyService = ({ app }: { app: App }): void => {
  app.config.globalProperties.$uppyService = new UppyService({
    language: app.config.globalProperties.$language
  })
  app.provide('$uppyService', app.config.globalProperties.$uppyService)
}

/**
 * @param vue
 * @param store
 * @param configurationManager
 */
export const announcePreviewService = ({
  app,
  store,
  configurationManager,
  userStore
}: {
  app: App
  store: Store<any>
  configurationManager: ConfigurationManager
  userStore: UserStore
}): void => {
  const clientService = app.config.globalProperties.$clientService
  const previewService = new PreviewService({
    store,
    clientService,
    configurationManager,
    userStore
  })
  app.config.globalProperties.$previewService = previewService
  app.provide('$previewService', previewService)
}

/**
 * announce authService and inject it into vue
 *
 * @param vue
 * @param configurationManager
 * @param store
 * @param router
 */
export const announceAuthService = ({
  app,
  configurationManager,
  store,
  router,
  userStore
}: {
  app: App
  configurationManager: ConfigurationManager
  store: Store<any>
  router: Router
  userStore: UserStore
}): void => {
  const ability = app.config.globalProperties.$ability
  const language = app.config.globalProperties.$language
  const clientService = app.config.globalProperties.$clientService
  authService.initialize(
    configurationManager,
    clientService,
    store,
    router,
    ability,
    language,
    userStore
  )
  app.config.globalProperties.$authService = authService
  app.provide('$authService', authService)
}

/**
 * @param vue
 */
export const announcePasswordPolicyService = ({ app }: { app: App }): void => {
  const language = app.config.globalProperties.$language
  const passwordPolicyService = new PasswordPolicyService({ language })
  app.config.globalProperties.passwordPolicyService = passwordPolicyService
  app.provide('$passwordPolicyService', passwordPolicyService)
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
  router: Router
}): void => {
  // set home route
  const appIds = store.getters.appIds
  let defaultExtensionId = store.getters.configuration.options.defaultExtension
  if (!defaultExtensionId || appIds.indexOf(defaultExtensionId) < 0) {
    defaultExtensionId = appIds[0]
  }

  let route = router.getRoutes().find((r) => {
    return r.path.startsWith(`/${defaultExtensionId}`) && r.meta?.entryPoint === true
  })
  if (!route) {
    route = store.getters.getNavItemsByExtension(defaultExtensionId)[0]?.route
  }
  if (route) {
    router.addRoute({
      path: '/',
      redirect: () => route
    })
  }
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
export const startSentry = (runtimeConfiguration: RuntimeConfiguration, app: App): void => {
  if (runtimeConfiguration.sentry?.dsn) {
    const { dsn, environment = 'production', ...moreSentryOptions } = runtimeConfiguration.sentry

    sentryInit({
      app,
      dsn,
      environment,
      attachProps: true,
      logErrors: true,
      ...moreSentryOptions
    })
  }
}

/**
 * announceCustomScripts injects custom header scripts.
 *
 * @param runtimeConfiguration
 */
export const announceCustomScripts = ({
  runtimeConfiguration
}: {
  runtimeConfiguration?: RuntimeConfiguration
}): void => {
  const { scripts = [] } = runtimeConfiguration

  scripts.forEach(({ src = '', async = false }) => {
    if (!src) {
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = async
    document.head.appendChild(script)
  })
}

/**
 * announceCustomStyles injects custom header styles.
 *
 * @param runtimeConfiguration
 */
export const announceCustomStyles = ({
  runtimeConfiguration
}: {
  runtimeConfiguration?: RuntimeConfiguration
}): void => {
  const { styles = [] } = runtimeConfiguration

  styles.forEach(({ href = '' }) => {
    if (!href) {
      return
    }

    const link = document.createElement('link')
    link.href = href
    link.type = 'text/css'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  })
}

const fileReadyEventSchema = z.object({
  itemid: z.string(),
  parentitemid: z.string()
})

const onSSEProcessingFinishedEvent = ({
  store,
  msg,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  clientService,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resourceQueue
}: {
  store: Store<unknown>
  msg: MessageEvent
  clientService: ClientService
  resourceQueue: PQueue
}) => {
  try {
    const postProcessingData = fileReadyEventSchema.parse(JSON.parse(msg.data))
    const currentFolder = store.getters['Files/currentFolder']
    if (!currentFolder) {
      return
    }

    // UPDATE_RESOURCE_FIELD only handles files in the currentFolder, so we can shortcut here for now
    if (!extractNodeId(currentFolder.id)) {
      // if we don't have a nodeId here, we have a space (root) as current folder and can only check against the storageId
      if (currentFolder.id !== extractStorageId(postProcessingData.parentitemid)) {
        return
      }
    } else {
      if (currentFolder.id !== postProcessingData.parentitemid) {
        return
      }
    }

    const isFileLoaded = !!(store.getters['Files/files'] as Resource[]).find(
      (f) => f.id === postProcessingData.itemid
    )
    if (isFileLoaded) {
      store.commit('Files/UPDATE_RESOURCE_FIELD', {
        id: postProcessingData.itemid,
        field: 'processing',
        value: false
      })
    } else {
      // FIXME: we currently cannot do this, we need to block this for ongoing uploads and copy operations
      // when fixing revert the changelog removal
      // resourceQueue.add(async () => {
      //   const { resource } = await clientService.webdav.listFilesById({
      //     fileId: postProcessingData.itemid
      //   })
      //   resource.path = urlJoin(currentFolder.path, resource.name)
      //   store.commit('Files/UPSERT_RESOURCE', resource)
      // })
    }
  } catch (e) {
    console.error('Unable to parse sse postprocessing data', e)
  }
}

export const registerSSEEventListeners = ({
  store,
  clientService,
  configurationManager
}: {
  store: Store<unknown>
  clientService: ClientService
  configurationManager: ConfigurationManager
}): void => {
  const resourceQueue = new PQueue({
    concurrency: configurationManager.options.concurrentRequests.sse
  })
  store.watch(
    (state, getters) => getters['Files/currentFolder'],
    () => {
      resourceQueue.clear()
    }
  )
  clientService.sseAuthenticated.addEventListener(MESSAGE_TYPE.POSTPROCESSING_FINISHED, (msg) =>
    onSSEProcessingFinishedEvent({ store, msg, clientService, resourceQueue })
  )
}

export const setViewOptions = ({ store }: { store: Store<unknown> }): void => {
  /**
   *   Storage returns a string so we need to convert it into a boolean
   */
  const areHiddenFilesShown = window.localStorage.getItem('oc_hiddenFilesShown') || 'false'
  const areHiddenFilesShownBoolean = areHiddenFilesShown === 'true'

  if (areHiddenFilesShownBoolean !== store.getters['Files/areHiddenFilesShown']) {
    store.commit('Files/SET_HIDDEN_FILES_VISIBILITY', areHiddenFilesShownBoolean)
  }

  const areFileExtensionsShown = window.localStorage.getItem('oc_fileExtensionsShown') || 'true'
  const areFileExtensionsShownBoolean = areFileExtensionsShown === 'true'

  if (areFileExtensionsShownBoolean !== store.getters['Files/areFileExtensionsShownBoolean']) {
    store.commit('Files/SET_FILE_EXTENSIONS_VISIBILITY', areFileExtensionsShownBoolean)
  }

  const areWebDavDetailsShown = window.localStorage.getItem('oc_webDavDetailsShown') || 'false'
  const areWebDavDetailsShownBoolean = areWebDavDetailsShown === 'true'

  if (areWebDavDetailsShownBoolean !== store.getters['Files/areWebDavDetailsShown']) {
    store.commit('Files/SET_FILE_WEB_DAV_DETAILS_VISIBILITY', areWebDavDetailsShownBoolean)
  }
}
