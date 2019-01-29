/* eslint-disable */
// --- Libraries and Plugins ---

import Vue from 'vue'

// --- Components ---

import Phoenix from './Phoenix.vue'

// --- Adding global libraries ---

import Vuetify from 'vuetify'
import Client from 'js-owncloud-client'
import Axios from 'axios'

import { sync } from 'vuex-router-sync'
import store from './store'
import router from './router'

// --- Plugins ----

import VueEvents from 'vue-events'
import VueRouter from 'vue-router'
import VueAxios from 'vue-axios'

// --- Gettext ----

import GetTextPlugin from 'vue-gettext'
import translations from '../l10n/translations.json'

// --- Drag Drop ----

import { Drag, Drop } from 'vue-drag-drop'

const _map = require('lodash/map')
const _flatten = require('lodash/flatten')
const _findIndex = require('lodash/findIndex')

Vue.prototype.$axios = Axios
Vue.prototype.$client = new Client()

Vue.use(VueEvents)
Vue.use(VueRouter)
Vue.use(VueAxios, Axios)
Vue.use(Vuetify, {
  options: {
    customProperties: true
  }
})

Vue.use(GetTextPlugin, {
  availableLanguages: {
    en: 'English',
    de: 'German'
  },
  defaultLanguage: navigator.language.substring(0, 2),
  translations: translations,
  silent: true
})

Vue.component('drag', Drag)
Vue.component('drop', Drop)

// --- Router ----

let apps
let config

function loadApps () {
  let plugins = []
  let navItems = []
  let routes = [{
    path: '/',
    redirect: to => arguments[0].navItems[0].route
  }]

  for (let app of arguments) {
    if (!app.appInfo) {
      console.error('Try to load app with missing appInfo...')
    }
    if (app.routes) {
      // rewrite relative app routes by prefix'ing their corresponding appId
      app.routes.forEach(r => (r.path = `/${encodeURI(app.appInfo.id)}${r.path}`))
      routes.push(app.routes)
    }
    if (app.plugins) plugins.push(app.plugins)
    if (app.navItems) navItems.push(app.navItems)
    if (app.store) store.registerModule(app.appInfo.name, app.store.default)
    store.dispatch('registerApp', app.appInfo)
  }
  router.addRoutes(_flatten(routes))
  sync(store, router)

  // inject custom config into vuex
  store.dispatch('loadConfig', config.data)

  const OC = new Vue({
    el: '#owncloud',
    data: {
      config: config.data,
      plugins: _flatten(plugins),
      navItems: _flatten(navItems)
    },
    store,
    router,
    render: h => h(Phoenix)
  })

  // inject custom theme config into vuex
  Axios.get(`themes/${config.data.theme}.json`).then(res => {
    store.dispatch('loadTheme', res.data)
    // TODO FOUC happens here; this color init is too late.
    OC.$vuetify.theme = res.data.colors
  })
}

function requireError (err) {
  if (err) {
    // display error to user
    let missingApps = []
    var failedId = err.requireModules && err.requireModules[0]
    missingApps.push(failedId)
    let index = _findIndex(apps, (a) => {
      return failedId === a.substring(2)
    })
    apps.splice(index, 1)
    config.data.state = 'corrupt'
    config.data.corrupted = missingApps
    requirejs(apps, loadApps, requireError)
  } else {
    throw err
  }
}

(async function () {
  try {
    let defaultConfig = false
    config = await Axios.get('config.json').catch(() => {
      defaultConfig = true
      return Axios.get('static/config.default.json')
    })
    if(defaultConfig) config.data.state = 'missing'
    apps = _map(config.data.apps, (app) => {
      return `./apps/${app}/${app}.bundle.js`
    })
    requirejs(apps, loadApps, requireError)
  } catch (err) {
    alert(err)
  }
})()
