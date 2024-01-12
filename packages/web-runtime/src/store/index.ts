import ancestorMetaData from './ancestorMetaData'
import apps from './apps'
import auth from './auth'
import config from './config'
import user from './user'
import navigation from './navigation'

const runtime = {
  namespaced: true,
  modules: {
    ancestorMetaData,
    auth
  }
}

export default {
  modules: {
    apps,
    user,
    config,
    navigation,
    runtime
  }
}
