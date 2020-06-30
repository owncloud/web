import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

/* STORE MODULES
 */
import app from './app'
import apps from './apps'
import config from './config'
import user from './user'
import router from './router'
import settings from './settings'
import modal from './modal'
import navigation from './navigation'
import sidebar from './sidebar'

Vue.use(Vuex)

const vuexPersistInSession = new VuexPersistence({
  key: 'phoenixStateInSessionStorage',
  // Browser tab independent storage which gets deleted after the tab is closed
  storage: window.sessionStorage,
  filter: mutation =>
    ['SAVE_URL_BEFORE_LOGIN', 'SET_USER', 'SET_TOKEN', 'SET_CAPABILITIES'].indexOf(mutation.type) >
    -1,
  modules: ['router', 'user']
})

const strict = process.env.NODE_ENV === 'development'

export const Store = new Vuex.Store({
  plugins: [vuexPersistInSession.plugin],
  modules: {
    app,
    apps,
    user,
    config,
    router,
    settings,
    modal,
    navigation,
    sidebar
  },
  strict
})

export default Store
