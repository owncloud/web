'use strict'

const state = {
  auth: {
    clientId: null,
    apiUrl: null,
    authUrl: null
  },
  theme: {
    general: {
      name: null,
      slogan: null
    },
    colors: {
      primary: null,
      secondary: null,
      accent: null,
      info: null,
      success: null,
      warning: null,
      error: null
    },
    logo: {
      mini: null,
      small: null,
      big: null
    }
  }
}

const actions = {
  loadConfig (context, config) {
    context.commit('LOAD_CONFIG', config)
  },
  loadTheme (context, theme) {
    context.commit('LOAD_THEME', theme)
  }
}

const mutations = {
  LOAD_CONFIG (state, config) {
    state.auth = config.auth
  },
  LOAD_THEME (state, theme) {
    state.theme = theme
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
