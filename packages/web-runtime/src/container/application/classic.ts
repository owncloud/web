import { ClassicApplicationScript, RuntimeApi } from '../types'
import { buildRuntimeApi } from '../api'
import Vue from 'vue'
import { isFunction, isObject } from 'lodash-es'
import { NextApplication } from './next'
import { Store } from 'vuex'
import VueRouter from 'vue-router'
import { RuntimeError } from '../error'

/**
 * this wraps a classic application structure into a next application format.
 * it is fully backward compatible and will stay around as a fallback.
 */
class ClassicApplication extends NextApplication {
  private readonly applicationScript: ClassicApplicationScript

  constructor(runtimeApi: RuntimeApi, applicationScript: ClassicApplicationScript) {
    super(runtimeApi)
    this.applicationScript = applicationScript
  }

  initialize(): Promise<void> {
    const { routes, navItems, translations, quickActions, store } = this.applicationScript

    routes && this.runtimeApi.announceRoutes(routes)
    navItems && this.runtimeApi.announceNavigationItems(navItems)
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

  mounted(instance: Vue): Promise<void> {
    const { mounted: mountedHook } = this.applicationScript
    this.attachPublicApi(mountedHook, instance)
    return Promise.resolve(undefined)
  }

  userReady(instance: Vue): Promise<void> {
    const { userReady: userReadyHook } = this.applicationScript
    this.attachPublicApi(userReadyHook, instance)
    return Promise.resolve(undefined)
  }

  private attachPublicApi(hook: unknown, instance?: Vue) {
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
        announceExtension: this.runtimeApi.announceExtension
      })
  }
}

/**
 *
 * @param applicationPath
 * @param store
 * @param router
 * @param translations
 * @param supportedLanguages
 */
export const convertClassicApplication = async ({
  applicationScript,
  store,
  router,
  translations,
  supportedLanguages
}: {
  applicationScript: ClassicApplicationScript
  store: Store<unknown>
  router: VueRouter
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

  return new ClassicApplication(runtimeApi, applicationScript)
}
