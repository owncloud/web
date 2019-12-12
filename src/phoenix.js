/* eslint-disable */
import "core-js/stable"
import "regenerator-runtime/runtime"
import "core-js/features/symbol/iterator.js"

// --- Libraries and Plugins ---
import Vue from 'vue'

// --- Components ---

import Phoenix from './Phoenix.vue'
import missingConfigPage from './pages/missingConfig.vue'

// --- Adding global libraries ---

import OwnCloud from 'owncloud-sdk'

import { sync } from 'vuex-router-sync'
import store from './store'
import router from './router'

// --- Plugins ----

import VueEvents from 'vue-events'
import VueRouter from 'vue-router'
import VueClipboard from 'vue-clipboard2'
import VueScrollTo from 'vue-scrollto'
import VueMeta from 'vue-meta'

// --- Gettext ----

import GetTextPlugin from 'vue-gettext'
import coreTranslations from '../l10n/translations.json'

// --- Image source ----

import MediaSource from './plugins/mediaSource.js'
import PhoenixPlugin from './plugins/phoenix'

// --- Drag Drop ----

import { Drag, Drop } from 'vue-drag-drop'

// Import the Design System
import DesignSystem from 'owncloud-design-system'
import 'owncloud-design-system/dist/system/system.css'

import wgxpath from 'wicked-good-xpath'
wgxpath.install()

Vue.prototype.$client = new OwnCloud()

Vue.use(VueEvents)
Vue.use(VueRouter)
Vue.use(DesignSystem)
Vue.use(VueClipboard)
Vue.use(VueScrollTo)
Vue.use(MediaSource)
Vue.use(PhoenixPlugin)
Vue.use(VueMeta, {
  // optional pluginOptions
  refreshOnceOnNavigation: true
})

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

      // adjust routes in nav items
      if (app.navItems) {
        app.navItems.forEach(nav => {
          const r = app.routes.find(function(element) {
            return element.name === nav.route.name;
          });
          if (r) {
            r.meta = r.meta || {}
            r.meta.pageIcon = nav.iconMaterial
            r.meta.pageTitle = nav.name
            nav.route.path = nav.route.path || r.path
          } else {
            console.error(`Unknown route name ${nav.route.name}`)
          }
        })
      }
      routes.push(app.routes)
    }
    if (app.plugins) {
      plugins.push(app.plugins)
    }
    if (app.navItems) {
      navItems.push(app.navItems)
    }
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
    if (config.external_apps) {
      store.dispatch('loadExternalAppConfig', { app: app.appInfo, config })
    }
  }
  router.addRoutes(routes.flat())
  sync(store, router)

  // inject custom config into vuex
  store.dispatch('loadConfig', config)

  // basic init of ownCloud sdk
  Vue.prototype.$client.init({ baseUrl: config.server || window.location.origin })

  Vue.use(GetTextPlugin, {
    availableLanguages: supportedLanguages,
    defaultLanguage: navigator.language.substring(0, 2),
    translations: translations,
    silent: true
  })

  // add menu items from config,json
  navItems = navItems.flat()
  if (config.menu && config.menu.items) {
    navItems= navItems.concat(config.menu.items)
  }

  const OC = new Vue({
    el: '#owncloud',
    data: {
      config: config,
      plugins: plugins.flat(),
      navItems: navItems
    },
    store,
    router,
    render: h => h(Phoenix)
  })

  // externalize Vue - this is not the Vue instance but the class
  window.Vue = Vue

  // inject custom theme config into vuex
  fetch(`themes/${config.theme}.json`)
    .then(res => res.json())
    .then(res => {
      store.dispatch('loadTheme', res)
    })
}

function missingConfig () {
  const translations = coreTranslations

  Vue.use(GetTextPlugin, {
    availableLanguages: supportedLanguages,
    defaultLanguage: navigator.language.substring(0, 2),
    translations: translations,
    silent: true
  })

  const OC = new Vue({
    el: '#owncloud',
    store,
    render: h => h(missingConfigPage)
  })
}

function requireError (err) {
  if (err) {
    // display error to user
    let missingApps = []
    const failedId = err.requireModules && err.requireModules[0]
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
    config = await fetch('config.json').catch(() => {
      config.state = 'missing'
    })
    config = await config.json()

    // Loads apps from internal server
    apps = config.apps.map((app) => {
      return `./apps/${app}/${app}.bundle.js`
    })

    // Loads apps from external servers
    if (config.external_apps) {
      config.external_apps.map(app => apps.push(app.path))
    }

    // provide global config object
    // TODO: frozen object would be great ...
    window.phoenixConfig = config

    requirejs(apps, loadApps, requireError)
  } catch (err) {
    router.push('missing-config')
    missingConfig()
  }
})()
