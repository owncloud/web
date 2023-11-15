import merge from 'lodash-es/merge'
import App from '../App.vue'
import missingOrInvalidConfigPage from '../pages/missingOrInvalidConfig.vue'
import { coreTranslations, clientTranslations, pkgTranslations, odsTranslations } from './json'

// fontawesome-free attributions console message
import '@fortawesome/fontawesome-free/attribution'

export { default as DesignSystem } from 'design-system'
export * from './languages'

export const pages = { success: App, failure: missingOrInvalidConfigPage }
export const translations = merge(
  {},
  coreTranslations,
  clientTranslations,
  pkgTranslations,
  odsTranslations
)
