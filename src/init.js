import 'core-js/stable'
import 'regenerator-runtime/runtime'
import 'core-js/features/symbol/iterator.js'

// --- Adding global libraries ---

import OwnCloud from 'owncloud-sdk'

import { sync } from 'vuex-router-sync'

// --- Gettext ----

import GetTextPlugin from 'vue-gettext'
import coreTranslations from '../l10n/translations.json'

// Import the Design System
import DesignSystem from 'owncloud-design-system'
import 'owncloud-design-system/dist/system/system.css'

import Avatar from './components/Avatar.vue'

import wgxpath from 'wicked-good-xpath'

let apps
let config
// FIXME: have these better encapsulated
const translations = coreTranslations
const navItems = {}
const plugins = []

const supportedLanguages = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  cs: 'Czech',
  fr: 'Français',
  it: 'Italiano',
  gl: 'Galego'
}

function loadApps (apps, { config, store, router }, navOnly = false) {
  const routes = [{
    path: '/',
    redirect: to => apps[0].navItems[0].route
  }]

  for (const app of apps) {
    if (!app.appInfo) {
      console.error('Try to load app with missing appInfo…')
    }
    if (app.routes) {
      // rewrite relative app routes by prefix'ing their corresponding appId
      app.routes.forEach(r => (r.path = `/${encodeURI(app.appInfo.id)}${r.path}`))

      // adjust routes in nav items
      if (app.navItems) {
        app.navItems.forEach(nav => {
          const r = app.routes.find(function (element) {
            return element.name === nav.route.name
          })
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
      if (!navOnly) {
        routes.push(app.routes)
      }
    }

    if (app.navItems) {
      navItems[app.appInfo.id] = app.navItems
    }

    if (!navOnly) {
      if (app.plugins) {
        plugins.push(app.plugins)
      }
      if (app.translations) {
        Object.keys(supportedLanguages).forEach((lang) => {
          if (translations[lang] && app.translations[lang]) {
            Object.assign(translations[lang], app.translations[lang])
          }
        })
      }

      if (app.store) {
        registerStoreModule(store, app)
      }

      store.dispatch('registerApp', app.appInfo)
      if (config.external_apps) {
        store.dispatch('loadExternalAppConfig', { app: app.appInfo, config })
      }
    }
  }

  if (!navOnly) {
    router.addRoutes(routes.flat())
    sync(store, router)
  }
}

function registerStoreModule (store, app) {
  if (app.store.default) {
    return store.registerModule(app.appInfo.name, app.store.default)
  }

  return store.registerModule(app.appInfo.name, app.store)
}

/**
 * Wrapper to promisify requirejs
 *
 * @param {Array.<String>} modules to load
 */
function requireApps (modules, { config, store, router }, navOnly = false) {
  return new Promise((resolve, reject) => {
    requirejs(modules, function () {
      loadApps(Array.from(arguments), { config, store, router }, navOnly)
      resolve()
    }, (err) => {
      if (err) {
        // display error to user
        const missingApps = []
        const failedId = err.requireModules && err.requireModules[0]
        missingApps.push(failedId)
        const index = apps.findIndex((a) => {
          return failedId === a.substring(2)
        })
        apps.splice(index, 1)
        config.state = 'corrupt'
        config.corrupted = missingApps
        return requireApps(apps, { config, store, router }, navOnly)
      } else {
        reject(err)
      }
    })
  })
}

async function loadConfig (baseUrl = '', { store, router }, navOnly = false) {
  if (baseUrl !== '' && !baseUrl.endsWith('/')) {
    baseUrl += '/'
  }
  config = await fetch(baseUrl + 'config.json')
    .then((response) => {
      return response.json()
    }).catch(() => {
      return {
        state: 'missing'
      }
    })

  // provide global config object, needed for some apps at load time...
  // TODO: frozen object would be great ...
  window.phoenixConfig = config

  if (config.state === 'missing') {
    return
  }

  // Loads apps from internal server
  apps = config.apps.map((app) => {
    return `./apps/${app}/${app}.bundle.js`
  })

  // Loads apps from external servers
  if (config.external_apps) {
    config.external_apps.map(app => apps.push(app.path))
  }

  // inject custom config into vuex
  if (store) {
    store.dispatch('loadConfig', config)
  }

  const promises = [
    fetch(`${baseUrl}themes/${config.theme}.json`)
      .then(res => res.json())
      .then(res => {
        if (store) {
          store.dispatch('loadTheme', res)
        }
      })
  ]

  // FIXME: make sure requirejs is available in web component
  if (window.requirejs) {
    promises.push(requireApps(apps, { config, store, router }, navOnly))
  }

  return promises
}

export default async function init (Vue, baseUrl = '', { router, store }, navOnly = false) {
  wgxpath.install()

  try {
    // this will populate navItems, plugins and translations
    await loadConfig(baseUrl, { router, store }, navOnly)

    // basic init of ownCloud sdk
    Vue.prototype.$client = new OwnCloud()
    Vue.prototype.$client.init({ baseUrl: config.server || window.location.origin })
  } catch (err) {
    console.error('Error loading configuration: ', err)
  }

  Vue.use(DesignSystem)

  Vue.component('avatar-image', Avatar)

  Vue.use(GetTextPlugin, {
    availableLanguages: supportedLanguages,
    defaultLanguage: navigator.language.substring(0, 2),
    translations: translations,
    silent: true
  })

  return { config, plugins, navItems }
}
