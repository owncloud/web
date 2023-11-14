const state = {
  accessToken: null,
  idpContextReady: false,
  userContextReady: false,
  publicLinkToken: null,
  publicLinkPassword: null,
  publicLinkType: null,
  publicLinkContextReady: false
}

const getters = {
  accessToken: (state) => state.accessToken,
  isIdpContextReady: (state) => state.idpContextReady,
  isUserContextReady: (state) => state.userContextReady,
  publicLinkToken: (state) => state.publicLinkToken,
  publicLinkPassword: (state) => state.publicLinkPassword,
  publicLinkType: (state) => state.publicLinkType,
  isPublicLinkContextReady: (state) => state.publicLinkContextReady
}

const mutations = {
  SET_ACCESS_TOKEN(state, accessToken) {
    state.accessToken = accessToken
  },
  SET_IDP_CONTEXT_READY(state, ready) {
    state.idpContextReady = ready
  },
  SET_USER_CONTEXT_READY(state, ready) {
    state.userContextReady = ready
  },
  SET_PUBLIC_LINK_CONTEXT(
    state,
    { publicLinkToken, publicLinkPassword, publicLinkType, publicLinkContextReady }
  ) {
    state.publicLinkToken = publicLinkToken
    state.publicLinkPassword = publicLinkPassword
    state.publicLinkType = publicLinkType
    if (typeof publicLinkContextReady === 'boolean') {
      state.publicLinkContextReady = publicLinkContextReady
    }
  }
}

const actions = {
  clearUserContext({ commit }) {
    commit('SET_ACCESS_TOKEN', null)
    commit('SET_IDP_CONTEXT_READY', false)
    commit('SET_USER_CONTEXT_READY', false)
  },
  clearPublicLinkContext({ commit }) {
    commit('SET_PUBLIC_LINK_CONTEXT', {
      publicLinkToken: null,
      publicLinkPassword: null,
      publicLinkType: null,
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
