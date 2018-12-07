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

Vue.prototype.$axios = Axios
Vue.prototype.$client = new Client()

Vue.use(VueEvents)
Vue.use(VueRouter)
Vue.use(VueAxios, Axios)
Vue.use(Vuetify)

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
Vue.component('drop', Drop);

// --- Router ----

(async function () {
  try {
    let config = await Axios.get('config.json')
    let apps = _map(config.data.apps, (app) => {
      return `./apps/${app}/js/${app}.bundle.js`
    })

    requirejs(apps, function () {
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
        if (app.routes) routes.push(app.routes)
        if (app.plugins) plugins.push(app.plugins)
        if (app.navItems) navItems.push(app.navItems)
        if (app.store) store.registerModule(app.appInfo.name, app.store.default)
        store.dispatch('registerApp', app.appInfo)
      }
      router.addRoutes(_flatten(routes))
      sync(store, router)

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
      // inject custom config into vuex
      store.dispatch('loadConfig', config.data)
      // inject custom theme config into vuex
      Axios.get(`themes/${config.data.theme}.json`).then(res => {
        store.dispatch('loadTheme', res.data)
        // TODO FOUC happens here; this color init is too late.
        OC.$vuetify.theme = res.data.colors
      })
    })
  } catch (err) {
    alert(err)
  }
})()
