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
  announceCustomizations,
  startSentry
} from './container'
import {
  buildPublicSpaceResource,
  buildSpace,
  isPublicSpaceResource,
  Resource
} from 'web-client/src/helpers'

export const bootstrap = async (configurationPath: string): Promise<void> => {
  const runtimeConfiguration = await announceConfiguration(configurationPath)
  startSentry(runtimeConfiguration, Vue)
  await announceStore({ vue: Vue, store, runtimeConfiguration })
  await initializeApplications({
    runtimeConfiguration,
    store,
    supportedLanguages,
    router,
    translations
  })
  announceClientService({ vue: Vue, runtimeConfiguration })
  announceUppyService({ vue: Vue })
  announcePermissionManager({ vue: Vue, store })
  await announceClient(runtimeConfiguration)
  await announceAuthService({ vue: Vue, configurationManager, store, router })
  announceTranslations({ vue: Vue, supportedLanguages, translations })
  await announceTheme({ store, vue: Vue, designSystem, runtimeConfiguration })
  announceCustomizations({ runtimeConfiguration })
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
    (userContextReady) => {
      if (!userContextReady) {
        return
      }
      // Load spaces to make them available across the application
      if (store.getters.capabilities?.spaces?.enabled) {
        const clientService = instance.$clientService
        const graphClient = clientService.graphAuthenticated(
          store.getters.configuration.server,
          store.getters['runtime/auth/accessToken']
        )
        const httpAuthenticatedClient = clientService.httpAuthenticated(
          store.getters['runtime/auth/accessToken']
        )

        store.dispatch('runtime/spaces/loadSpaces', { graphClient })
        store.dispatch('runtime/spaces/loadSpaceQuotas', { httpAuthenticatedClient })
        return
      }

      // Spaces feature not available. Create a virtual personal space
      const user = store.getters.user
      const space = buildSpace({
        id: user.id,
        driveAlias: `personal/${user.id}`,
        driveType: 'personal',
        name: user.id,
        webDavPath: `/files/${user.id}`,
        serverUrl: configurationManager.serverUrl
      })
      store.commit('runtime/spaces/ADD_SPACES', [space])
      store.commit('runtime/spaces/SET_SPACES_INITIALIZED', true)
    },
    {
      immediate: true
    }
  )
  store.watch(
    (state, getters) => {
      return getters['runtime/auth/isPublicLinkContextReady']
    },
    (publicLinkContextReady) => {
      if (!publicLinkContextReady) {
        return
      }
      // Create virtual space for public link
      const publicLinkToken = store.getters['runtime/auth/publicLinkToken']
      const publicLinkPassword = store.getters['runtime/auth/publicLinkPassword']
      const space = buildPublicSpaceResource({
        id: publicLinkToken,
        ...(publicLinkPassword && { publicLinkPassword }),
        serverUrl: configurationManager.serverUrl
      })
      store.commit('runtime/spaces/ADD_SPACES', [space])
      store.commit('runtime/spaces/SET_SPACES_INITIALIZED', true)
    },
    {
      immediate: true
    }
  )
  store.watch(
    // only needed if a public link gets re-resolved with a changed password prop (changed or removed).
    // don't need to set { immediate: true } on the watcher.
    (state, getters) => {
      return getters['runtime/auth/publicLinkPassword']
    },
    (publicLinkPassword: string | undefined) => {
      const publicLinkToken = store.getters['runtime/auth/publicLinkToken']
      const space = store.getters['runtime/spaces/spaces'].find((space: Resource) => {
        return isPublicSpaceResource(space) && space.id === publicLinkToken
      })
      if (!space) {
        return
      }
      space.publicLinkPassword = publicLinkPassword
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
