import merge from 'lodash-es/merge'
import App from '../App.vue'
import missingOrInvalidConfigPage from '../pages/missingOrInvalidConfig.vue'

// fontawesome-free attributions console message
import '@fortawesome/fontawesome-free/attribution'

export { default as DesignSystem } from 'design-system'
export * from './languages'

export const pages = { success: App, failure: missingOrInvalidConfigPage }

export const loadTranslations = async () => {
  const { coreTranslations, clientTranslations, pkgTranslations, odsTranslations } = await import(
    './json'
  )

  return merge({}, coreTranslations, clientTranslations, pkgTranslations, odsTranslations)
}
