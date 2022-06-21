import app from './app'
import apps from './apps'
import config from './config'
import user from './user'
import settings from './settings'
import modal from './modal'
import navigation from './navigation'

const strict = process.env.NODE_ENV === 'development'

export default {
  modules: {
    app,
    apps,
    user,
    config,
    settings,
    modal,
    navigation
  },
  strict
}
