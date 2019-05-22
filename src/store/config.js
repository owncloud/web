'use strict'

const state = {
  state: null,
  auth: {
    clientId: String,
    apiUrl: String,
    authUrl: String,
    metaDataUrl: String
  },
  theme: {
    general: {
      name: String,
      slogan: String
    },
    colors: {
      primary: String,
      secondary: String,
      accent: String,
      info: String,
      success: String,
      warning: String,
      error: String
    },
    logo: {
      mini: String,
      small: String,
      big: String,
      background: String
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
    state.state = config.state === undefined ? 'working' : config.state
    if (config.corrupted) state.corrupted = config.corrupted
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
