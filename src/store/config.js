'use strict'

const state = {
  auth: {
    clientId: null,
    apiUrl: null,
    authUrl: null
  }
}

const actions = {
  loadConfig (context, config) {
    context.commit('LOAD_CONFIG', config)
  }
}

const mutations = {
  LOAD_CONFIG (state, config) {
    state.auth = config.auth
  }
}

const getters = {
  configuration: state => {
    return state
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}
