import state from './state'
import mutations from './mutations'
import getters from './getters'
const namespaced = true

export default {
  namespaced,
  state,
  getters,
  mutations
}
