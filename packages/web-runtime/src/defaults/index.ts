import merge from 'lodash-es/merge'
import App from '../App.vue'
import missingOrInvalidConfigPage from '../pages/missingOrInvalidConfig.vue'
import Store from '../store'
import { coreTranslations, clientTranslations, pkgTranslations, odsTranslations } from './json'
import { createStore } from 'vuex-extensions'
import Vuex from 'vuex'

// fontawesome-free attributions console message
import '@fortawesome/fontawesome-free/attribution'

export { default as Vue } from './vue'
export { default as DesignSystem } from '@ownclouders/design-system'

export const store = createStore(Vuex.Store, { ...Store })
export const pages = { success: App, failure: missingOrInvalidConfigPage }
export const translations = merge(
  {},
  coreTranslations,
  clientTranslations,
  pkgTranslations,
  odsTranslations
)
export const supportedLanguages = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  cs: 'Czech',
  fr: 'Français',
  it: 'Italiano',
  gl: 'Galego'
}
