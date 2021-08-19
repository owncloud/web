export default {
  namespaced: true,
  state: () => ({
    closed: true
  }),
  mutations: {
    SET_CLOSED(state, closed) {
      state.closed = closed
    }
  },
  actions: {
    open({ commit }) {
      commit('SET_CLOSED', false)
    },
    close({ commit }) {
      commit('SET_CLOSED', true)
    },
    toggle({ commit, state }) {
      commit('SET_CLOSED', !state.closed)
    }
  }
}
