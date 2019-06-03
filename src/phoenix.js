/* eslint-disable */
import "core-js/stable"
import "regenerator-runtime/runtime"
import "core-js/features/symbol/iterator.js"

// --- Libraries and Plugins ---
import Vue from 'vue'

// --- Components ---

import Phoenix from './Phoenix.vue'

// --- Adding global libraries ---

import ownCloud from 'owncloud-sdk'

import { sync } from 'vuex-router-sync'
import store from './store'
import router from './router'

// --- Plugins ----

import VueEvents from 'vue-events'
import VueRouter from 'vue-router'

// --- Gettext ----

import GetTextPlugin from 'vue-gettext'
import coreTranslations from '../l10n/translations.json'

// --- Drag Drop ----

import { Drag, Drop } from 'vue-drag-drop'

// Import the Design System
import DesignSystem from 'owncloud-design-system'
import 'owncloud-design-system/dist/system/system.css'

Vue.prototype.$client = new ownCloud()

Vue.use(VueEvents)
Vue.use(VueRouter)
Vue.use(DesignSystem)

Vue.component('drag', Drag)
Vue.component('drop', Drop)

// --- Router ----

let apps
let config
const supportedLanguages = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  cs: 'Czech',
  fr: 'Français',
  it: 'Italiano',
  gl: 'Galego'
}

function loadApps () {
  let plugins = []
  let navItems = []
  let translations = coreTranslations

  let routes = [{
    path: '/',
    redirect: to => arguments[0].navItems[0].route
  }]

  for (let app of Array.from(arguments)) {
    if (!app.appInfo) {
      console.error('Try to load app with missing appInfo…')
    }
    if (app.routes) {
      // rewrite relative app routes by prefix'ing their corresponding appId
      app.routes.forEach(r => (r.path = `/${encodeURI(app.appInfo.id)}${r.path}`))
      routes.push(app.routes)
    }
    if (app.plugins) plugins.push(app.plugins)
    if (app.navItems) navItems.push(app.navItems)
    if (app.translations) {
      Object.keys(supportedLanguages).forEach((lang) => {
        if (translations[lang] && app.translations[lang]) {
          Object.assign(translations[lang], app.translations[lang])
        }
      })
    }
    if (app.store) {
      store.registerModule(app.appInfo.name, app.store.default)
    }
    store.dispatch('registerApp', app.appInfo)
  }
  router.addRoutes(routes.flat())
  sync(store, router)

  // inject custom config into vuex
  store.dispatch('loadConfig', config)

  Vue.use(GetTextPlugin, {
    availableLanguages: supportedLanguages,
    defaultLanguage: navigator.language.substring(0, 2),
    translations: translations,
    silent: true
  })

  const OC = new Vue({
    el: '#owncloud',
    data: {
      config: config,
      plugins: plugins.flat(),
      navItems: navItems.flat()
    },
    store,
    router,
    render: h => h(Phoenix)
  })


  // inject custom theme config into vuex
  fetch(`themes/${config.theme}.json`)
    .then(res => res.json())
    .then(res => {
      store.dispatch('loadTheme', res)
      // TODO FOUC happens here; this color init is too late.
      //OC.$vuetify.theme = res.colors
    })
}

function requireError (err) {
  if (err) {
    // display error to user
    let missingApps = []
    var failedId = err.requireModules && err.requireModules[0]
    missingApps.push(failedId)
    let index = apps.findIndex((a) => {
      return failedId === a.substring(2)
    })
    apps.splice(index, 1)
    config.state = 'corrupt'
    config.corrupted = missingApps
    requirejs(apps, loadApps, requireError)
  } else {
    throw err
  }
}

(async function () {
  try {
    let defaultConfig = false
    config = await fetch('config.json').catch(() => {
      defaultConfig = true
      return fetch('static/config.default.json')
    })
    config = await config.json()
    if(defaultConfig) config.state = 'missing'
    apps = config.apps.map((app) => {
      return `./apps/${app}/${app}.bundle.js`
    })
    requirejs(apps, loadApps, requireError)
  } catch (err) {
    alert(err)
  }
})()
