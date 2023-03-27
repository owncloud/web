import merge from 'lodash-es/merge'
import App from '../App.vue'
import missingOrInvalidConfigPage from '../pages/missingOrInvalidConfig.vue'
import { coreTranslations, clientTranslations, pkgTranslations, odsTranslations } from './json'

// fontawesome-free attributions console message
import '@fortawesome/fontawesome-free/attribution'

export { default as DesignSystem } from 'design-system'

export const pages = { success: App, failure: missingOrInvalidConfigPage }
export const translations = merge(
  {},
  coreTranslations,
  clientTranslations,
  pkgTranslations,
  odsTranslations
)
export const supportedLanguages = {
  ar: 'اَلْعَرَبِيَّةُ',
  bg: 'български',
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  cs: 'Czech',
  fr: 'Français',
  gl: 'Galego',
  he: 'עִבְרִית',
  it: 'Italiano',
  pl: 'Polski',
  ru: 'русский язык',
  sk: 'Slovenčina',
  sq: 'Shqipja',
  tr: 'Türkçe'
}
