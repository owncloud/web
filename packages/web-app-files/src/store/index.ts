import state from './state'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'
const namespaced = true

export default {
  namespaced,
  state,
  getters,
  actions,
  mutations
}
