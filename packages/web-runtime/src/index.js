// --- Styles ---
import 'vue-resize/dist/vue-resize.css'

// --- Libraries and Plugins ---
import Vue from './vue'
import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'

// --- Components ---
import App from './App.vue'
import missingOrInvalidConfigPage from './pages/missingOrInvalidConfig.vue'

// --- Adding global libraries ---
import OwnCloud from 'owncloud-sdk'

import { sync } from 'vuex-router-sync'
import Store from './store'
import router from './router'

// --- Plugins ----
import VueResize from 'vue-resize'
import VueEvents from 'vue-events'
import VueRouter from 'vue-router'
import VueScrollTo from 'vue-scrollto'
import VueMeta from 'vue-meta'
import Vue2TouchEvents from 'vue2-touch-events'
import VueAxe from 'vue-axe'

// --- Mixins ----
import focusMixin from './mixins/focusMixin'
import lifecycleMixin from './mixins/lifecycleMixin'

// --- Directive ---
import ClickOutsideDirective from './directives/clickOutside'

// --- Gettext ----
import GetTextPlugin from 'vue-gettext'
import coreTranslations from '../l10n/translations.json'
import odsTranslations from 'owncloud-design-system/dist/system/translations.json'

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

import { registerClient } from './services/clientRegistration'

import { loadConfig } from './helpers/config'
import { loadTheme } from './helpers/theme'

import merge from 'lodash-es/merge'

Vue.prototype.$client = new OwnCloud()

Vue.use(VueEvents)
Vue.use(Vuex)
Vue.use(VueRouter)
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

Vue.mixin(focusMixin)
Vue.mixin(lifecycleMixin)

Vue.directive('click-outside', ClickOutsideDirective)

// --- DEV only ----
if (process.env.NODE_ENV === 'development') {
  Vue.use(VueAxe, {
    allowConsoleClears: false
  })
}

/* --- Store --- */
const store = createStore(Vuex.Store, { ...Store })

// --- Router ----

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

const translations = merge({}, coreTranslations, odsTranslations)

const loadApp = async path => {
  const app = await new Promise((resolve, reject) =>
    requirejs(
      [path],
      app => resolve(app),
      err => reject(err)
    )
  )

  if (!app.appInfo) {
    throw new Error('Skipping without appInfo for app ' + path)
  }

  if (app.routes) {
    // rewrite relative app routes by prefixing their corresponding appId
    app.routes = app.routes.map(route => {
      route.name = app.appInfo.id === route.name ? route.name : `${app.appInfo.id}-${route.name}`
      route.path = `/${encodeURI(app.appInfo.id)}${route.path}`

      if (route.children) {
        route.children = route.children.map(child => {
          child.name = `${app.appInfo.id}-${child.name}`

          return child
        })
      }

      return route
    })

    router.addRoutes(app.routes)
  }

  if (app.navItems) {
    store.commit('SET_NAV_ITEMS_FROM_CONFIG', {
      extension: app.appInfo.id,
      navItems: app.navItems
    })
  }

  if (app.translations) {
    Object.keys(supportedLanguages).forEach(lang => {
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
}

const finalizeInit = async () => {
  // set home route
  const appIds = store.getters.appIds
  let defaultExtensionId = store.getters.configuration.options.defaultExtension
  if (!defaultExtensionId || appIds.indexOf(defaultExtensionId) < 0) {
    defaultExtensionId = appIds[0]
  }

  router.addRoutes([
    {
      path: '/',
      redirect: () => store.getters.getNavItemsByExtension(defaultExtensionId)[0].route
    }
  ])

  // sync router into store
  sync(store, router)

  // inject custom config into vuex
  await store.dispatch('loadConfig', config)

  // basic init of ownCloud sdk
  Vue.prototype.$client.init({ baseUrl: config.server || window.location.origin })

  // inject custom theme config into vuex
  await fetchTheme(config.theme)

  loadTranslations()

  // TODO: Find a different way to access store from withit JS files
  Vue.$store = store

  // eslint-disable-next-line no-new
  new Vue({
    el: '#owncloud',
    store,
    router,
    render: h => h(App)
  })
}

const fetchTheme = async location => {
  const { theme } = await loadTheme(location)
  await store.dispatch('loadTheme', { theme: theme.default })

  Vue.use(DesignSystem, {
    tokens: store.getters.theme.designTokens
  })
}

const missingOrInvalidConfig = async () => {
  loadTranslations()

  // inject custom theme config into vuex
  await fetchTheme()

  // eslint-disable-next-line no-new
  new Vue({
    el: '#owncloud',
    store,
    render: h => h(missingOrInvalidConfigPage)
  })
}

const loadTranslations = () => {
  Vue.use(GetTextPlugin, {
    availableLanguages: supportedLanguages,
    defaultLanguage: navigator.language.substring(0, 2),
    translations,
    silent: true
  })
}

export const exec = async () => {
  try {
    config = await loadConfig()
  } catch (err) {
    console.log(err)
    router.push('missing-config')
    missingOrInvalidConfig(err)
    return
  }

  try {
    // if dynamic client registration is necessary - do this here now
    if (config.openIdConnect && config.openIdConnect.dynamic) {
      const clientData = await registerClient(config.openIdConnect)
      config.openIdConnect.client_id = clientData.client_id
      config.openIdConnect.client_secret = clientData.client_secret
    }

    // Collect internal app paths
    const apps = config.apps.map(app => `web-app-${app}`)

    // Collect external app paths
    if (config.external_apps) {
      apps.push(...config.external_apps.map(app => app.path))
    }

    // requirejs.config({waitSeconds:200}) is not really working ... reason unknown
    // we are manipulating requirejs directly
    requirejs.s.contexts._.config.waitSeconds = 200

    // Boot apps
    for (const path of apps) {
      // please note that we have to go through apps one by one for now, to not break e.g. translations loading (race conditions)
      try {
        await loadApp(path)
      } catch (err) {
        console.error('failed to load app ' + path, err)
      }
    }

    // Finalize loading core and apps
    await finalizeInit()
  } catch (err) {
    console.log(err)
  }
}
