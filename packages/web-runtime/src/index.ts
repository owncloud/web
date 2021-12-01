import {
  DesignSystem as designSystem,
  pages,
  translations,
  supportedLanguages,
  store,
  Router as router,
  Vue
} from './defaults'
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
  const promiseOcSDK = announceOwncloudSDK({ vue: Vue, runtimeConfiguration }) // vue.$client
  const promiseClient = announceClient(runtimeConfiguration) // oidc client
  const promiseTheme = announceTheme({ store, vue: Vue, designSystem, runtimeConfiguration })
  await promiseOcSDK
  await promiseClient
  await announceStore({ vue: Vue, store, runtimeConfiguration }) // REQUIRES $client and oidc
  const promiseApplications = announceApplications({
    runtimeConfiguration,
    store,
    supportedLanguages,
    router,
    translations
  })
  await promiseTheme
  await promiseApplications
  announceTranslations({ vue: Vue, supportedLanguages, translations })
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
