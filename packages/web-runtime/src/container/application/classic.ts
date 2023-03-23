import { ClassicApplicationScript, RuntimeApi } from '../types'
import { buildRuntimeApi } from '../api'
import { App } from 'vue'
import { isFunction, isObject } from 'lodash-es'
import { NextApplication } from './next'
import { Store } from 'vuex'
import { Router } from 'vue-router'
import { RuntimeError } from '../error'
import { AppReadyHookArgs } from 'web-pkg/src/apps'

/**
 * this wraps a classic application structure into a next application format.
 * it is fully backward compatible and will stay around as a fallback.
 */
class ClassicApplication extends NextApplication {
  private readonly applicationScript: ClassicApplicationScript
  private readonly app: App

  constructor(runtimeApi: RuntimeApi, applicationScript: ClassicApplicationScript, app: App) {
    super(runtimeApi)
    this.applicationScript = applicationScript
    this.app = app
  }

  initialize(): Promise<void> {
    const { routes, navItems, translations, quickActions, store } = this.applicationScript
    const { globalProperties } = this.app.config
    const _routes = typeof routes === 'function' ? routes(globalProperties) : routes
    const _navItems = typeof navItems === 'function' ? navItems(globalProperties) : navItems

    routes && this.runtimeApi.announceRoutes(_routes)
    navItems && this.runtimeApi.announceNavigationItems(_navItems)
    translations && this.runtimeApi.announceTranslations(translations)
    quickActions && this.runtimeApi.announceQuickActions(quickActions)
    store && this.runtimeApi.announceStore(store)

    return Promise.resolve(undefined)
  }

  ready(): Promise<void> {
    const { ready: readyHook } = this.applicationScript
    this.attachPublicApi(readyHook)
    return Promise.resolve(undefined)
  }

  mounted(instance: App): Promise<void> {
    const { mounted: mountedHook } = this.applicationScript
    this.attachPublicApi(mountedHook, instance)
    return Promise.resolve(undefined)
  }

  private attachPublicApi(hook: (arg: AppReadyHookArgs) => void, instance?: App) {
    isFunction(hook) &&
      hook({
        ...(instance && {
          portal: {
            open: (...args) => this.runtimeApi.openPortal.apply(instance, [instance, ...args])
          }
        }),
        instance,
        store: this.runtimeApi.requestStore(),
        router: this.runtimeApi.requestRouter(),
        announceExtension: this.runtimeApi.announceExtension,
        globalProperties: this.app.config.globalProperties
      })
  }
}

/**
 *
 * @param app
 * @param applicationPath
 * @param store
 * @param router
 * @param translations
 * @param supportedLanguages
 */
export const convertClassicApplication = async ({
  app,
  applicationScript,
  store,
  router,
  translations,
  supportedLanguages
}: {
  app: App
  applicationScript: ClassicApplicationScript
  store: Store<unknown>
  router: Router
  translations: unknown
  supportedLanguages: { [key: string]: string }
}): Promise<NextApplication> => {
  const { appInfo } = applicationScript

  if (!isObject(appInfo)) {
    throw new RuntimeError("appInfo can't be blank")
  }

  const { id: applicationId, name: applicationName } = appInfo

  if (!applicationId) {
    throw new RuntimeError("appInfo.id can't be blank")
  }

  if (!applicationName) {
    throw new RuntimeError("appInfo.name can't be blank")
  }

  const runtimeApi = buildRuntimeApi({
    applicationName,
    applicationId,
    store,
    router,
    translations,
    supportedLanguages
  })

  await store.dispatch('registerApp', applicationScript.appInfo)

  return new ClassicApplication(runtimeApi, applicationScript, app)
}
