import { loadDesignSystem, pages, loadTranslations, supportedLanguages } from './defaults'
import { router } from './router'
import { PortalTarget, AppProviderService } from '@ownclouders/web-pkg'
import { createHead } from '@vueuse/head'
import { abilitiesPlugin } from '@casl/vue'
import { createMongoAbility } from '@casl/ability'

import {
  announceConfiguration,
  initializeApplications,
  announceApplicationsReady,
  announceClient,
  announceDefaults,
  announceClientService,
  announceTheme,
  announcePiniaStores,
  announceCustomStyles,
  announceTranslations,
  announceVersions,
  announceUppyService,
  announceAuthService,
  startSentry,
  announceCustomScripts,
  announceLoadingService,
  announcePreviewService,
  announcePasswordPolicyService,
  registerSSEEventListeners,
  setViewOptions,
  announceGettext,
  announceArchiverService,
  announceAppProviderService
} from './container/bootstrap'
import { applicationStore } from './container/store'
import {
  buildPublicSpaceResource,
  isPersonalSpaceResource,
  isPublicSpaceResource,
  PublicSpaceResource
} from '@ownclouders/web-client'
import { loadCustomTranslations } from 'web-runtime/src/helpers/customTranslations'
import { createApp, watch } from 'vue'
import PortalVue, { createWormhole } from 'portal-vue'
import { createPinia } from 'pinia'
import Avatar from './components/Avatar.vue'
import focusMixin from './mixins/focusMixin'
import { UnifiedRoleDefinition } from '@ownclouders/web-client/graph/generated'
import { extensionPoints } from './extensionPoints'
import { isSilentRedirectRoute } from './helpers/silentRedirect'

export const bootstrapApp = async (configurationPath: string, appsReadyCallback: () => void) => {
  const isSilentRedirect = isSilentRedirectRoute()

  const pinia = createPinia()
  const app = createApp(isSilentRedirect ? pages.tokenRenewal : pages.success)
  app.use(pinia)

  const {
    appsStore,
    authStore,
    configStore,
    capabilityStore,
    extensionRegistry,
    spacesStore,
    userStore,
    resourcesStore,
    messagesStore,
    sharesStore,
    webWorkersStore
  } = announcePiniaStores()

  extensionRegistry.registerExtensionPoints(extensionPoints())

  app.provide('$router', router)

  await announceConfiguration({ path: configurationPath, configStore })

  app.use(abilitiesPlugin, createMongoAbility([]), { useGlobalProperties: true })

  const gettext = announceGettext({ app, availableLanguages: supportedLanguages })

  const clientService = announceClientService({ app, configStore, authStore })
  announceAuthService({
    app,
    configStore,
    router,
    userStore,
    authStore,
    capabilityStore,
    webWorkersStore
  })

  let appProviderService: AppProviderService
  if (!isSilentRedirect) {
    const designSystem = await loadDesignSystem()

    announceUppyService({ app })
    startSentry(configStore, app)
    appProviderService = announceAppProviderService({ app, capabilityStore, clientService })
    announceArchiverService({ app, configStore, userStore, capabilityStore })
    announceLoadingService({ app })
    announcePreviewService({
      app,
      configStore,
      userStore,
      authStore,
      capabilityStore
    })
    announcePasswordPolicyService({ app })
    await announceClient(configStore)

    app.config.globalProperties.$wormhole = createWormhole()
    app.use(PortalVue, {
      wormhole: app.config.globalProperties.$wormhole,
      // do not register portal-target component so we can register our own wrapper
      portalTargetName: false
    })
    app.component('PortalTarget', PortalTarget)

    const applicationsPromise = initializeApplications({
      app,
      configStore,
      router,
      appProviderService
    })
    const translationsPromise = loadTranslations()
    const customTranslationsPromise = loadCustomTranslations({ configStore })
    const themePromise = announceTheme({ app, designSystem, configStore })
    const [coreTranslations, customTranslations] = await Promise.all([
      translationsPromise,
      customTranslationsPromise,
      applicationsPromise,
      themePromise
    ])

    announceTranslations({ appsStore, gettext, coreTranslations, customTranslations })

    announceCustomStyles({ configStore })
    announceCustomScripts({ configStore })
    announceDefaults({ appsStore, router, extensionRegistry, configStore })
  }

  app.use(router)
  app.use(createHead())

  app.component('AvatarImage', Avatar)
  app.mixin(focusMixin)

  app.mount('#owncloud')

  if (isSilentRedirect) {
    return
  }

  setViewOptions({ resourcesStore })

  const applications = Array.from(applicationStore.values())
  applications.forEach((application) => application.mounted(app))

  watch(
    () =>
      authStore.userContextReady || authStore.idpContextReady || authStore.publicLinkContextReady,
    async (newValue, oldValue) => {
      if (!newValue || newValue === oldValue) {
        return
      }
      announceVersions({ capabilityStore })

      await appProviderService.loadData()
      const appProviderApps = await initializeApplications({
        app,
        configStore,
        router,
        appProviderService,
        dynamicApps: true
      })
      appProviderApps.forEach((application) => application.mounted(app))

      await announceApplicationsReady({
        app,
        appsStore,
        applications: [...applications, ...appProviderApps]
      })
      appsReadyCallback()
    },
    {
      immediate: true
    }
  )

  watch(
    () => authStore.userContextReady,
    async (userContextReady) => {
      if (!userContextReady) {
        return
      }

      const clientService = app.config.globalProperties.$clientService
      const previewService = app.config.globalProperties.$previewService
      const passwordPolicyService = app.config.globalProperties.passwordPolicyService
      passwordPolicyService.initialize(capabilityStore)

      // Register SSE event listeners
      if (capabilityStore.supportSSE) {
        registerSSEEventListeners({
          language: gettext,
          resourcesStore,
          spacesStore,
          messageStore: messagesStore,
          sharesStore,
          clientService,
          userStore,
          previewService,
          configStore,
          router
        })
      }

      // Load spaces to make them available across the application
      await spacesStore.loadSpaces({ graphClient: clientService.graphAuthenticated })
      const personalSpace = spacesStore.spaces.find(isPersonalSpaceResource)

      if (personalSpace) {
        spacesStore.updateSpaceField({
          id: personalSpace.id,
          field: 'name',
          value: app.config.globalProperties.$gettext('Personal')
        })
      }

      // load sharing roles from graph API
      const { data } =
        await clientService.graphAuthenticated.roleManagement.listPermissionRoleDefinitions()

      // FIXME: graph type is wrong
      sharesStore.setGraphRoles(data as UnifiedRoleDefinition[])
    },
    {
      immediate: true
    }
  )
  watch(
    () => authStore.publicLinkContextReady,
    (publicLinkContextReady) => {
      if (!publicLinkContextReady) {
        return
      }
      // Create virtual space for public link
      const publicLinkToken = authStore.publicLinkToken
      const publicLinkPassword = authStore.publicLinkPassword
      const publicLinkType = authStore.publicLinkType

      const space = buildPublicSpaceResource({
        id: publicLinkToken,
        name: app.config.globalProperties.$gettext('Public files'),
        ...(publicLinkPassword && { publicLinkPassword }),
        serverUrl: configStore.serverUrl,
        publicLinkType: publicLinkType
      })

      spacesStore.addSpaces([space])
      spacesStore.setSpacesInitialized(true)
    },
    {
      immediate: true
    }
  )
  watch(
    // only needed if a public link gets re-resolved with a changed password prop (changed or removed).
    // don't need to set { immediate: true } on the watcher.
    () => authStore.publicLinkPassword,
    (publicLinkPassword: string | undefined) => {
      const publicLinkToken = authStore.publicLinkToken
      const space = spacesStore.spaces.find((space) => {
        return isPublicSpaceResource(space) && space.id === publicLinkToken
      })
      if (!space) {
        return
      }
      ;(space as PublicSpaceResource).publicLinkPassword = publicLinkPassword
    }
  )
}

export const bootstrapErrorApp = async (err: Error): Promise<void> => {
  const { capabilityStore, configStore } = announcePiniaStores()
  announceVersions({ capabilityStore })
  const app = createApp(pages.failure)
  const designSystem = await loadDesignSystem()
  await announceTheme({ app, designSystem, configStore })
  console.error(err)
  const translations = await loadTranslations()
  const gettext = announceGettext({ app, availableLanguages: supportedLanguages })
  announceTranslations({ gettext, coreTranslations: translations })
  app.mount('#owncloud')
}
;(window as any).runtimeLoaded({
  bootstrapApp,
  bootstrapErrorApp
})
