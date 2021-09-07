import state from './state'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'
import sidebarModule from './modules/sidebar'
import paginationModule from './modules/pagination'
const namespaced = true

export default {
  namespaced,
  state,
  getters,
  actions,
  mutations,
  modules: {
    sidebar: sidebarModule,
    pagination: paginationModule
  }
}
