import { DesignSystem as designSystem, pages, translations, supportedLanguages } from './defaults'
import { router } from './router'
import { PortalTarget, configurationManager } from '@ownclouders/web-pkg'
import { createHead } from '@vueuse/head'
import { abilitiesPlugin } from '@casl/vue'
import { createMongoAbility } from '@casl/ability'
import merge from 'lodash-es/merge'

import {
  announceConfiguration,
  initializeApplications,
  announceApplicationsReady,
  announceClient,
  announceDefaults,
  announceClientService,
  announceStore,
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
  announceAdditionalTranslations,
  registerSSEEventListeners,
  setViewOptions
} from './container/bootstrap'
import { applicationStore } from './container/store'
import {
  buildPublicSpaceResource,
  isPersonalSpaceResource,
  isPublicSpaceResource,
  PublicSpaceResource
} from '@ownclouders/web-client/src/helpers'
import { loadCustomTranslations } from 'web-runtime/src/helpers/customTranslations'
import { computed, createApp } from 'vue'
import PortalVue, { createWormhole } from 'portal-vue'
import { createPinia } from 'pinia'
import Avatar from './components/Avatar.vue'
import focusMixin from './mixins/focusMixin'
import { ArchiverService } from '@ownclouders/web-pkg'

export const bootstrapApp = async (configurationPath: string): Promise<void> => {
  const pinia = createPinia()
  const app = createApp(pages.success)
  app.use(pinia)

  const { appsStore, authStore, capabilityStore, extensionRegistry, spacesStore, userStore } =
    announcePiniaStores()

  app.provide('$router', router)

  const runtimeConfiguration = await announceConfiguration(configurationPath)
  startSentry(runtimeConfiguration, app)

  const store = await announceStore({ runtimeConfiguration, appsStore })
  app.provide('store', store)

  app.use(abilitiesPlugin, createMongoAbility([]), { useGlobalProperties: true })

  const gettext = announceTranslations({
    app,
    availableLanguages: supportedLanguages,
    translations
  })
  announceUppyService({ app })

  announceClientService({
    app,
    runtimeConfiguration,
    configurationManager,
    userStore,
    authStore,
    capabilityStore
  })
  // TODO: move to announceArchiverService function
  app.config.globalProperties.$archiverService = new ArchiverService(
    app.config.globalProperties.$clientService,
    store.getters.configuration.server || window.location.origin,
    computed(
      () =>
        capabilityStore.filesArchivers || [
          {
            enabled: true,
            version: '1.0.0',
            formats: ['tar', 'zip'],
            archiver_url: `${store.getters.configuration.server}index.php/apps/files/ajax/download.php`
          }
        ]
    )
  )
  app.provide('$archiverService', app.config.globalProperties.$archiverService)
  announceLoadingService({ app })
  announcePreviewService({
    app,
    store,
    configurationManager,
    userStore,
    authStore,
    capabilityStore
  })
  announcePasswordPolicyService({ app })
  await announceClient(runtimeConfiguration)

  app.config.globalProperties.$wormhole = createWormhole()
  app.use(PortalVue, {
    wormhole: app.config.globalProperties.$wormhole,
    // do not register portal-target component so we can register our own wrapper
    portalTargetName: false
  })
  app.component('PortalTarget', PortalTarget)

  const applicationsPromise = initializeApplications({
    app,
    runtimeConfiguration,
    configurationManager,
    store,
    supportedLanguages,
    router,
    gettext
  })

  const customTranslationsPromise = loadCustomTranslations({ configurationManager })
  const themePromise = announceTheme({ app, designSystem, runtimeConfiguration })
  const [customTranslations] = await Promise.all([
    customTranslationsPromise,
    applicationsPromise,
    themePromise
  ])

  announceAdditionalTranslations({ gettext, translations: merge(customTranslations) })

  announceAuthService({
    app,
    configurationManager,
    router,
    userStore,
    authStore,
    capabilityStore
  })
  announceCustomStyles({ runtimeConfiguration })
  announceCustomScripts({ runtimeConfiguration })
  announceDefaults({ store, appsStore, router, extensionRegistry })

  app.use(router)
  app.use(store)
  app.use(createHead())

  app.component('AvatarImage', Avatar)
  app.mixin(focusMixin)

  app.mount('#owncloud')

  setViewOptions({ store })

  const applications = Array.from(applicationStore.values())
  applications.forEach((application) => application.mounted(app))

  store.watch(
    () =>
      authStore.userContextReady || authStore.idpContextReady || authStore.publicLinkContextReady,
    async (newValue, oldValue) => {
      if (!newValue || newValue === oldValue) {
        return
      }
      announceVersions({ capabilityStore })
      await announceApplicationsReady({ app, appsStore, applications })
    },
    {
      immediate: true
    }
  )

  store.watch(
    () => {
      return authStore.userContextReady
    },
    async (userContextReady) => {
      if (!userContextReady) {
        return
      }

      const clientService = app.config.globalProperties.$clientService
      const passwordPolicyService = app.config.globalProperties.passwordPolicyService
      passwordPolicyService.initialize(capabilityStore)

      // Register SSE event listeners
      if (capabilityStore.supportSSE) {
        registerSSEEventListeners({ store, clientService, configurationManager })
      }

      // Load spaces to make them available across the application
      await spacesStore.loadSpaces({ graphClient: clientService.graphAuthenticated })
      const personalSpace = spacesStore.spaces.find(isPersonalSpaceResource)

      if (!personalSpace) {
        return
      }

      spacesStore.updateSpaceField({
        id: personalSpace.id,
        field: 'name',
        value: app.config.globalProperties.$gettext('Personal')
      })
    },
    {
      immediate: true
    }
  )
  store.watch(
    () => {
      return authStore.publicLinkContextReady
    },
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
        serverUrl: configurationManager.serverUrl,
        publicLinkType: publicLinkType
      })

      spacesStore.addSpaces([space])
      spacesStore.setSpacesInitialized(true)
    },
    {
      immediate: true
    }
  )
  store.watch(
    // only needed if a public link gets re-resolved with a changed password prop (changed or removed).
    // don't need to set { immediate: true } on the watcher.
    () => {
      return authStore.publicLinkPassword
    },
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
  const { appsStore } = announcePiniaStores()
  const store = await announceStore({ runtimeConfiguration: {}, appsStore })
  const { capabilityStore } = announcePiniaStores()
  announceVersions({ capabilityStore })
  const app = createApp(pages.failure)
  await announceTheme({ app, designSystem })
  console.error(err)
  app.use(store)
  await announceTranslations({
    app,
    availableLanguages: supportedLanguages,
    translations
  })
  app.mount('#owncloud')
}
;(window as any).runtimeLoaded({
  bootstrapApp,
  bootstrapErrorApp
})
