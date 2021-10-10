import state from './state'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'
import listingModule from './modules/listing'
import paginationModule from './modules/pagination'
import sidebarModule from './modules/sidebar'
const namespaced = true

export default {
  namespaced,
  state,
  getters,
  actions,
  mutations,
  modules: {
    listing: listingModule,
    pagination: paginationModule,
    sidebar: sidebarModule
  }
}
