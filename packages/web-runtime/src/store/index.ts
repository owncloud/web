import ancestorMetaData from './ancestorMetaData'
import apps from './apps'
import config from './config'

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
    runtime
  }
}
