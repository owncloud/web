export default {
  namespaced: true,
  state: () => ({
    closed: true,
    activePanel: null
  }),
  mutations: {
    SET_CLOSED(state, closed) {
      state.closed = closed
    },
    SET_ACTIVE_PANEL(state, panel) {
      state.activePanel = panel
    }
  },
  actions: {
    open({ commit }) {
      commit('SET_CLOSED', false)
      commit('SET_ACTIVE_PANEL', null)
    },
    openWithPanel({ commit }, panel) {
      commit('SET_CLOSED', false)
      commit('SET_ACTIVE_PANEL', panel)
    },
    close({ commit }) {
      commit('SET_CLOSED', true)
      commit('SET_ACTIVE_PANEL', null)
    },
    toggle({ commit, state }) {
      commit('SET_CLOSED', !state.closed)
    },
    setActivePanel({ commit }, panel) {
      commit('SET_ACTIVE_PANEL', panel)
    },
    resetActivePanel({ commit }) {
      commit('SET_ACTIVE_PANEL', null)
    }
  }
}
