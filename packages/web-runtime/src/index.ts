import {
  DesignSystem as designSystem,
  pages,
  translations,
  supportedLanguages,
  store,
  Vue
} from './defaults'

import { router } from './router'
import { configurationManager } from 'web-pkg/src/configuration'

import {
  announceConfiguration,
  initializeApplications,
  announceApplicationsReady,
  announceClient,
  announceDefaults,
  announceClientService,
  announceStore,
  announceTheme,
  announceTranslations,
  announceVersions,
  applicationStore,
  announceUppyService,
  announceAuthService,
  announcePermissionManager,
  startSentry
} from './container'

export const bootstrap = async (configurationPath: string): Promise<void> => {
  const runtimeConfiguration = await announceConfiguration(configurationPath)
  startSentry(runtimeConfiguration, Vue)
  await announceStore({ vue: Vue, store, runtimeConfiguration })
  const applications = initializeApplications({
    runtimeConfiguration,
    store,
    supportedLanguages,
    router,
    translations
  })
  const theme = announceTheme({ store, vue: Vue, designSystem, runtimeConfiguration })
  announceClientService({ vue: Vue, runtimeConfiguration })
  await announceClient(runtimeConfiguration)
  const authService = announceAuthService({ vue: Vue, configurationManager, store, router }) // Requires client
  await Promise.allSettled([applications, authService, theme])
  announceUppyService({ vue: Vue })
  announcePermissionManager({ vue: Vue, store })
  announceTranslations({ vue: Vue, supportedLanguages, translations })
  announceDefaults({ store, router })
}

export const renderSuccess = (): void => {
  const applications = Array.from(applicationStore.values())
  const instance = new Vue({
    el: '#owncloud',
    store,
    router,
    render: (h) => h(pages.success)
  })

  instance.$once('mounted', () => {
    applications.forEach((application) => application.mounted(instance))
  })

  store.watch(
    (state, getters) =>
      getters['runtime/auth/isUserContextReady'] ||
      getters['runtime/auth/isPublicLinkContextReady'],
    async (newValue, oldValue) => {
      if (!newValue || newValue === oldValue) {
        return
      }
      announceVersions({ store })
      await announceApplicationsReady({ applications })
    },
    {
      immediate: true
    }
  )

  store.watch(
    (state, getters) => {
      return getters['runtime/auth/isUserContextReady']
    },
    () => {
      // Load spaces to make them available across the application
      if (store.getters.capabilities?.spaces?.enabled) {
        const clientService = instance.$clientService
        const graphClient = clientService.graphAuthenticated(
          store.getters.configuration.server,
          store.getters['runtime/auth/accessToken']
        )
        store.dispatch('runtime/spaces/loadSpaces', { graphClient })
      }
    },
    {
      immediate: true
    }
  )
}

export const renderFailure = async (err: Error): Promise<void> => {
  announceVersions({ store })
  await announceTranslations({ vue: Vue, supportedLanguages, translations })
  await announceTheme({ store, vue: Vue, designSystem })
  console.error(err)
  new Vue({
    el: '#owncloud',
    store,
    render: (h) => h(pages.failure)
  })
}
