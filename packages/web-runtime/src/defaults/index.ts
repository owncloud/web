import 'owncloud-design-system/dist/system/system.css'
import merge from 'lodash-es/merge'
import App from '../App.vue'
import missingOrInvalidConfigPage from '../pages/missingOrInvalidConfig.vue'
import Store from '../store'
import { coreTranslations, odsTranslations } from './json'
import { createStore } from 'vuex-extensions'
import Vuex from 'vuex'
export { default as Vue } from './vue'
export { default as DesignSystem } from 'owncloud-design-system'
export { default as Router } from '../router'

export const store = createStore(Vuex.Store, { ...Store })
export const pages = { success: App, failure: missingOrInvalidConfigPage }
export const translations = merge({}, coreTranslations, odsTranslations)
export const supportedLanguages = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  cs: 'Czech',
  fr: 'Français',
  it: 'Italiano',
  gl: 'Galego'
}
