import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

/* STORE MODULES
*/
import app from './app'
import apps from './apps'
import config from './config'
import user from './user'
import links from './links'

Vue.use(Vuex)

const vuexPersist = new VuexPersistence({
  key: 'phoenixState',
  storage: window.localStorage,
  filter: (mutation) => ([
    'SET_USER',
    'SET_TOKEN',
    'SET_CAPABILITIES'
  ].indexOf(mutation.type) > -1),
  modules: ['user']
})

const vuexPersistInSession = new VuexPersistence({
  key: 'phoenixStateInSessionStorage',
  // Browser tab independent storage which gets deleted after the tab is closed
  storage: window.sessionStorage,
  filter: (mutation) => (['SET_PRIVATE_LINK_ITEM_ID'].indexOf(mutation.type) > -1),
  modules: ['links']
})

const strict = process.env.NODE_ENV === 'development'

export const Store = new Vuex.Store({
  // state: {
  //   someModulelessState: 0
  // },
  plugins: [vuexPersist.plugin, vuexPersistInSession.plugin],
  modules: {
    app,
    apps,
    user,
    config,
    links
  },
  strict
})

export default Store
