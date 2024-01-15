import ancestorMetaData from './ancestorMetaData'
import config from './config'

const runtime = {
  namespaced: true,
  modules: {
    ancestorMetaData
  }
}

export default {
  modules: {
    config,
    runtime
  }
}
