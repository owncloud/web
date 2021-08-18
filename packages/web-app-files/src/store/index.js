import state from './state'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'
import sidebar from './sidebar'
const namespaced = true

export default {
  namespaced,
  state,
  getters,
  actions,
  mutations,
  modules: {
    sidebar
  },
}
