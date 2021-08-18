
export default {
    state: () => ({
        sidebarClosed: true
    }),
    mutations: {
        SET_SIDEBAR_CLOSED(state, closed) {
            state.sidebarClosed = closed;
        }
    },
    actions: {
        open({commit}) {
            commit('SET_SIDEBAR_CLOSED', false)
        },
        close({commit}) {
            commit('SET_SIDEBAR_CLOSED', true)
        },
        toggle({commit, state}) {
            commit('SET_SIDEBAR_CLOSED', !state.sidebarClosed)
        }
    },
    namespaced: true
}