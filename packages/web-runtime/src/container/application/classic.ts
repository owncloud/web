import { RuntimeApi } from '../types'
import { buildRuntimeApi } from '../api'
import { App } from 'vue'
import { isFunction, isObject } from 'lodash-es'
import { NextApplication } from './next'
import { Router } from 'vue-router'
import { RuntimeError, useAppsStore } from '@ownclouders/web-pkg'
import { AppConfigObject, AppReadyHookArgs, ClassicApplicationScript } from '@ownclouders/web-pkg'
import { useExtensionRegistry } from '@ownclouders/web-pkg'
import type { Language } from 'vue3-gettext'

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
    const { routes, navItems, translations } = this.applicationScript
    const { globalProperties } = this.app.config
    const _routes = typeof routes === 'function' ? routes(globalProperties) : routes
    const _navItems = typeof navItems === 'function' ? navItems(globalProperties) : navItems

    routes && this.runtimeApi.announceRoutes(_routes)
    navItems && this.runtimeApi.announceNavigationItems(_navItems)
    translations && this.runtimeApi.announceTranslations(translations)

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
        router: this.runtimeApi.requestRouter(),
        globalProperties: this.app.config.globalProperties
      })
  }
}

/**
 *
 * @param app
 * @param applicationPath
 * @param router
 * @param translations
 * @param supportedLanguages
 */
export const convertClassicApplication = ({
  app,
  applicationScript,
  applicationConfig,
  router,
  gettext,
  supportedLanguages
}: {
  app: App
  applicationScript: ClassicApplicationScript
  applicationConfig: AppConfigObject
  router: Router
  gettext: Language
  supportedLanguages: { [key: string]: string }
}): NextApplication => {
  if (applicationScript.setup) {
    applicationScript = app.runWithContext(() => {
      return applicationScript.setup({
        ...(applicationConfig && { applicationConfig })
      })
    })
  }

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

  const extensionRegistry = useExtensionRegistry()

  const runtimeApi = buildRuntimeApi({
    applicationName,
    applicationId,
    router,
    gettext,
    supportedLanguages,
    extensionRegistry
  })

  const appsStore = useAppsStore()
  appsStore.registerApp(applicationScript.appInfo)

  if (applicationScript.extensions) {
    extensionRegistry.registerExtensions(applicationScript.extensions)
  }

  return new ClassicApplication(runtimeApi, applicationScript, app)
}
