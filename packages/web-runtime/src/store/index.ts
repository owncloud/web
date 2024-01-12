import ancestorMetaData from './ancestorMetaData'
import apps from './apps'
import config from './config'
import navigation from './navigation'

const runtime = {
  namespaced: true,
  modules: {
    ancestorMetaData
  }
}

export default {
  modules: {
    apps,
    config,
    navigation,
    runtime
  }
}
