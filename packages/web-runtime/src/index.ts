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
  Resource
} from '@ownclouders/web-client/src/helpers'
import { loadCustomTranslations } from 'web-runtime/src/helpers/customTranslations'
import { computed, createApp } from 'vue'
import PortalVue, { createWormhole } from 'portal-vue'
import { createPinia } from 'pinia'
import Avatar from './components/Avatar.vue'
import focusMixin from './mixins/focusMixin'
import { ArchiverService } from '@ownclouders/web-pkg'
import { get } from 'lodash-es'

export const bootstrapApp = async (configurationPath: string): Promise<void> => {
  const pinia = createPinia()
  const app = createApp(pages.success)
  app.use(pinia)

  const { userStore } = announcePiniaStores()

  app.provide('$router', router)

  const runtimeConfiguration = await announceConfiguration(configurationPath)
  startSentry(runtimeConfiguration, app)

  const store = await announceStore({ runtimeConfiguration })
  app.provide('$store', store)
  app.provide('store', store)

  app.use(abilitiesPlugin, createMongoAbility([]), { useGlobalProperties: true })

  const gettext = announceTranslations({
    app,
    availableLanguages: supportedLanguages,
    translations
  })
  announceUppyService({ app })

  announceClientService({ app, runtimeConfiguration, configurationManager, store, userStore })
  // TODO: move to announceArchiverService function
  app.config.globalProperties.$archiverService = new ArchiverService(
    app.config.globalProperties.$clientService,
    store.getters.configuration.server || window.location.origin,
    computed(() =>
      get(store, 'getters.capabilities.files.archivers', [
        {
          enabled: true,
          version: '1.0.0',
          formats: ['tar', 'zip'],
          archiver_url: `${store.getters.configuration.server}index.php/apps/files/ajax/download.php`
        }
      ])
    )
  )
  app.provide('$archiverService', app.config.globalProperties.$archiverService)
  announceLoadingService({ app })
  announcePreviewService({ app, store, configurationManager, userStore })
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

  announceAuthService({ app, configurationManager, store, router, userStore })
  announceCustomStyles({ runtimeConfiguration })
  announceCustomScripts({ runtimeConfiguration })
  announceDefaults({ store, router })

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
    (state, getters) =>
      getters['runtime/auth/isUserContextReady'] ||
      getters['runtime/auth/isIdpContextReady'] ||
      getters['runtime/auth/isPublicLinkContextReady'],
    async (newValue, oldValue) => {
      if (!newValue || newValue === oldValue) {
        return
      }
      announceVersions({ store })
      await announceApplicationsReady({ app, store, applications })
    },
    {
      immediate: true
    }
  )

  store.watch(
    (state, getters) => {
      return getters['runtime/auth/isUserContextReady']
    },
    async (userContextReady) => {
      if (!userContextReady) {
        return
      }

      const clientService = app.config.globalProperties.$clientService
      const passwordPolicyService = app.config.globalProperties.passwordPolicyService
      passwordPolicyService.initialize(store)

      // Register SSE event listeners
      if (store.getters.capabilities?.core?.['support-sse']) {
        registerSSEEventListeners({ store, clientService, configurationManager })
      }

      // Load spaces to make them available across the application
      const graphClient = clientService.graphAuthenticated
      await store.dispatch('runtime/spaces/loadSpaces', { graphClient })
      const personalSpace = store.getters['runtime/spaces/spaces'].find((space) =>
        isPersonalSpaceResource(space)
      )

      if (!personalSpace) {
        return
      }

      store.commit('runtime/spaces/UPDATE_SPACE_FIELD', {
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
      const publicLinkType = store.getters['runtime/auth/publicLinkType']

      const space = buildPublicSpaceResource({
        id: publicLinkToken,
        name: app.config.globalProperties.$gettext('Public files'),
        ...(publicLinkPassword && { publicLinkPassword }),
        serverUrl: configurationManager.serverUrl,
        publicLinkType: publicLinkType
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

export const bootstrapErrorApp = async (err: Error): Promise<void> => {
  const store = await announceStore({ runtimeConfiguration: {} })
  announceVersions({ store })
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
