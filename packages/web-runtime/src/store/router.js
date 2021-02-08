const state = {
  urlBeforeLogin: null
}

const actions = {
  saveUrlBeforeLogin({ commit }, url) {
    commit('SAVE_URL_BEFORE_LOGIN', url)
  }
}

const mutations = {
  SAVE_URL_BEFORE_LOGIN(state, url) {
    state.urlBeforeLogin = url
  }
}

const getters = {
  urlBeforeLogin: state => state.urlBeforeLogin
}

export default {
  state,
  actions,
  mutations,
  getters
}
