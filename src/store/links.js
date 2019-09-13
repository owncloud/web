const state = {
  /**
   * Private link path in case user needs to log in first
   * @return {string} path to the file/folder
   */
  privateLinkUrlPath: null
}

const actions = {
  setPrivateLinkUrlPath ({ commit }, path) {
    commit('SET_PRIVATE_LINK_URL_PATH', path)
  }
}

const mutations = {
  SET_PRIVATE_LINK_URL_PATH (state, path) {
    state.privateLinkUrlPath = path
  }
}

const getters = {
  privateLinkUrlPath: state => state.privateLinkUrlPath
}

export default {
  state,
  actions,
  mutations,
  getters
}
