const state = {
  accessToken: null,
  userContextReady: false,
  publicLinkToken: null,
  publicLinkPassword: null,
  publicLinkContextReady: false
}

const getters = {
  accessToken: (state) => state.accessToken,
  isUserContextReady: (state) => state.userContextReady,
  publicLinkToken: (state) => state.publicLinkToken,
  publicLinkPassword: (state) => state.publicLinkPassword,
  isPublicLinkContextReady: (state) => state.publicLinkContextReady
}

const mutations = {
  SET_USER_CONTEXT(state, { accessToken, userContextReady }) {
    state.accessToken = accessToken
    if (typeof userContextReady === 'boolean') {
      state.userContextReady = userContextReady
    }
  },
  SET_PUBLIC_LINK_CONTEXT(state, { publicLinkToken, publicLinkPassword, publicLinkContextReady }) {
    state.publicLinkToken = publicLinkToken
    state.publicLinkPassword = publicLinkPassword
    if (typeof publicLinkContextReady === 'boolean') {
      state.publicLinkContextReady = publicLinkContextReady
    }
  }
}

const actions = {
  clearUserContext({ commit }) {
    commit('SET_USER_CONTEXT', { accessToken: null, userContextReady: false })
  },
  clearPublicLinkContext({ commit }) {
    commit('SET_PUBLIC_LINK_CONTEXT', {
      publicLinkToken: null,
      publicLinkPassword: null,
      publicLinkContextReady: false
    })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
