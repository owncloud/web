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

const vuexPersistInSession = new VuexPersistence({
  key: 'webStateInSessionStorage',
  // Browser tab independent storage which gets deleted after the tab is closed
  storage: window.sessionStorage,
  reducer: state => {
    const { userReady, ...user } = state.user
    return {
      user,
      router: state.router
    }
  }
})

const strict = process.env.NODE_ENV === 'development'

export default {
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
}
