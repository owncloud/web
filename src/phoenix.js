// --- Libraries and Plugins ---
import Vue from 'vue'
import 'vue-resize/dist/vue-resize.css'
import VueResize from 'vue-resize'

import Phoenix from './Phoenix.vue'
import missingConfigPage from './pages/missingConfig.vue'

import init from './init'
import store from './store'
import router from './router'

// --- Plugins ----

import VueEvents from 'vue-events'
import VueRouter from 'vue-router'
import VueClipboard from 'vue-clipboard2'
import VueScrollTo from 'vue-scrollto'
import VueMeta from 'vue-meta'

// --- Image source ----

import MediaSource from './plugins/mediaSource.js'
import PhoenixPlugin from './plugins/phoenix'

// --- Drag Drop ----

import { Drag, Drop } from 'vue-drag-drop'

// --- Global Components ---
import Avatar from './components/Avatar.vue'

Vue.use(VueEvents)
Vue.use(VueRouter)
Vue.use(VueClipboard)
Vue.use(VueScrollTo)
Vue.use(MediaSource)
Vue.use(PhoenixPlugin)
Vue.use(VueResize)
Vue.use(VueMeta, {
  // optional pluginOptions
  refreshOnceOnNavigation: true
})
Vue.component('drag', Drag)
Vue.component('drop', Drop)
Vue.component('avatar-image', Avatar)

async function boot () {
  const { config, plugins, navItems } = await init(Vue, '', { store, router })

  if (config.state === 'missing') {
    router.push('missing-config')
    window.OC = new Vue({
      el: '#owncloud',
      store,
      render: h => h(missingConfigPage)
    })
  } else {
    window.OC = new Vue({
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
  }
}

boot()
