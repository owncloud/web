/* eslint-disable */
import 'regenerator-runtime/runtime'

// --- Libraries and Plugins ---
import Vue from './vue'
import 'vue-resize/dist/vue-resize.css'
import VueResize from 'vue-resize'

// --- Components ---
import App from './App.vue'
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
import Vue2TouchEvents from 'vue2-touch-events'

// --- Gettext ----
import GetTextPlugin from 'vue-gettext'
import coreTranslations from '../l10n/translations.json'

// --- Image source ----
import MediaSource from './plugins/mediaSource.js'
import WebPlugin from './plugins/web'
import ChunkedUpload from './plugins/upload'

// --- Drag Drop ----
import { Drag, Drop } from 'vue-drag-drop'

// Import the Design System
import DesignSystem from 'owncloud-design-system'
import 'owncloud-design-system/dist/system/system.css'

import Avatar from './components/Avatar.vue'

import wgxpath from 'wicked-good-xpath'

import { registerClient } from './services/clientRegistration'

wgxpath.install()

Vue.prototype.$client = new OwnCloud()

Vue.use(VueEvents)
Vue.use(VueRouter)
Vue.use(DesignSystem)
Vue.use(VueClipboard)
Vue.use(VueScrollTo)
Vue.use(MediaSource)
Vue.use(WebPlugin)
Vue.use(VueResize)
Vue.use(VueMeta, {
  // optional pluginOptions
  refreshOnceOnNavigation: true
})
Vue.use(ChunkedUpload)
Vue.use(Vue2TouchEvents)

Vue.component('drag', Drag)
Vue.component('drop', Drop)
Vue.component('avatar-image', Avatar)

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
let translations = coreTranslations

async function loadApp (path) {
  return new Promise((resolve, reject) => {
    requirejs([path], async function() {
      const app = arguments[0]

      if (!app.appInfo) {
        reject('Skipping without appInfo for app ' + path)
      }

      if (app.routes) {
        // rewrite relative app routes by prefixing their corresponding appId
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
        router.addRoutes(app.routes)
      }

      if (app.navItems) {
        store.commit('SET_NAV_ITEMS_FROM_CONFIG', {
          extension: app.appInfo.id,
          navItems: app.navItems
        })
      }
      if (app.translations) {
        Object.keys(supportedLanguages).forEach((lang) => {
          if (translations[lang] && app.translations[lang]) {
            Object.assign(translations[lang], app.translations[lang])
          }
        })
      }

      if (app.quickActions) {
        store.commit('ADD_QUICK_ACTIONS', app.quickActions)
      }

      if (app.store) {
        store.registerModule(app.appInfo.name, app.store.default || app.store)
      }

      await store.dispatch('registerApp', app.appInfo)
      resolve(true)
    }, function(err) {
      reject("failed to load app " + path)
    })
  })
}

async function finalizeInit () {
  // set home route
  const appIds = store.getters.appIds
  let defaultExtensionId = store.getters.configuration.options.defaultExtension
  if (!defaultExtensionId || appIds.indexOf(defaultExtensionId) < 0) {
    defaultExtensionId = appIds[0]
  }
  router.addRoutes([{
    path: '/',
    redirect: () => store.getters.getNavItemsByExtension(defaultExtensionId)[0].route
  }])

  // sync router into store
  sync(store, router)

  // inject custom config into vuex
  await store.dispatch('loadConfig', config)

  // basic init of ownCloud sdk
  Vue.prototype.$client.init({ baseUrl: config.server || window.location.origin })

  // inject custom theme config into vuex
  await fetchTheme()

  loadTranslations()
  new Vue({
    el: '#owncloud',
    store,
    router,
    render: h => h(App)
  })
}

function fetchTheme() {
  return new Promise((resolve, reject) => {
    fetch(`themes/${config.theme}.json`)
      .then(res => res.json())
      .then(res => {
        store.dispatch('loadTheme', { theme: res, name: config.theme }).then(() => resolve(true))
      })
      .catch(err => reject(err))
  })
}

function missingConfig () {
  loadTranslations()
  new Vue({
    el: '#owncloud',
    store,
    render: h => h(missingConfigPage)
  })
}

function loadTranslations () {
  Vue.use(GetTextPlugin, {
    availableLanguages: supportedLanguages,
    defaultLanguage: navigator.language.substring(0, 2),
    translations,
    silent: true
  })
}

(async function () {
  let config
  try {
    config = await fetch('config.json')
  } catch(e) {
    // if the config.json is missing, try like we're in an oc10 app
    const oc10AppUrl = window.location.href.substring(0, window.location.href.indexOf('/#') + 1)
    try {
      config = await fetch(oc10AppUrl + 'config')
    } catch(e) {
    }
  }

  if (!config || config.status === 404) {
    router.push('missing-config')
    missingConfig()
    return
  }

  try {
    config = await config.json()

    // if dynamic client registration is necessary - do this here now
    if (config.openIdConnect && config.openIdConnect.dynamic) {
      const clientData = await registerClient(config.openIdConnect)
      config.openIdConnect.client_id = clientData.client_id
      config.openIdConnect.client_secret = clientData.client_secret
    }

    // Collect internal app paths
    apps = config.apps.map((app) => {
      return `./apps/${app}/${app}.bundle.js`
    })

    // Collect external app paths
    if (config.external_apps) {
      apps.push(...config.external_apps.map(app => app.path))
    }

    // requirejs.config({waitSeconds:200}) is not really working ... reason unknown
    // we are manipulating requirejs directly
    requirejs.s.contexts._.config.waitSeconds = 200

    // Boot apps
    for(const path of apps) {
      // please note that we have to go through apps one by one for now, to not break e.g. translations loading (race conditions)
      try {
        await loadApp(path)
      } catch(err) {}
    }

    // Finalize loading core and apps
    await finalizeInit()
  } catch (err) {
    console.log(err)
  }
})()
