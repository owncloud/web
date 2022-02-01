import {
  DesignSystem as designSystem,
  pages,
  translations,
  supportedLanguages,
  store,
  Vue
} from './defaults'

import { router } from './router'

import {
  requestConfiguration,
  announceApplications,
  announceClient,
  announceDefaults,
  announceOwncloudSDK,
  announceStore,
  announceTheme,
  announceTranslations,
  announceVersions,
  applicationStore
} from './container'

export const bootstrap = async (configurationPath: string): Promise<void> => {
  const runtimeConfiguration = await requestConfiguration(configurationPath)
  announceOwncloudSDK({ vue: Vue, runtimeConfiguration })
  await announceClient(runtimeConfiguration)
  await announceStore({ vue: Vue, store, runtimeConfiguration })
  await announceApplications({
    runtimeConfiguration,
    store,
    supportedLanguages,
    router,
    translations
  })
  announceTranslations({ vue: Vue, supportedLanguages, translations })
  await announceTheme({ store, vue: Vue, designSystem, runtimeConfiguration })
  announceDefaults({ store, router })
}

export const renderSuccess = (): void => {
  announceVersions({ store })
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
    (state, getters) => getters.isUserReady,
    (newValue, oldValue) => {
      if (!newValue || newValue === oldValue) {
        return
      }
      applications.forEach((application) => application.userReady(instance))
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
