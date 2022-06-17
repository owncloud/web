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
import tours from './tours'

const vuexPersistInSession = new VuexPersistence({
  key: 'webStateInSessionStorage',
  // Browser tab independent storage which gets deleted after the tab is closed
  storage: window.sessionStorage,
  reducer: (state) => {
    const { user, navigation, router } = state
    return {
      user,
      navigation,
      router
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
    tours
  },
  strict
}
