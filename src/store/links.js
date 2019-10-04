const state = {
  /**
   * Private link item id in case user needs to log in first
   * @return {string} id of the file/folder shared via private link
   */
  privateLinkItemId: null
}

const actions = {
  setPrivateLinkItemId ({ commit }, id) {
    commit('SET_PRIVATE_LINK_ITEM_ID', id)
  }
}

const mutations = {
  SET_PRIVATE_LINK_ITEM_ID (state, id) {
    state.privateLinkItemId = id
  }
}

const getters = {
  privateLinkItemId: state => state.privateLinkItemId
}

export default {
  state,
  actions,
  mutations,
  getters
}
