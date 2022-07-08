import app from './app'
import apps from './apps'
import auth from './auth'
import config from './config'
import user from './user'
import settings from './settings'
import modal from './modal'
import navigation from './navigation'
import tours from './tours'

const strict = process.env.NODE_ENV === 'development'

const runtime = {
  namespaced: true,
  modules: {
    auth
  }
}

export default {
  modules: {
    app,
    apps,
    user,
    config,
    settings,
    modal,
    navigation,
    runtime,
    tours
  },
  strict
}
