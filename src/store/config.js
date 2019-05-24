'use strict'

const state = {
  state: null,
  auth: {
    clientId: '',
    apiUrl: '',
    authUrl: '',
    metaDataUrl: ''
  },
  theme: {
    general: {
      name: '',
      slogan: ''
    },
    colors: {
      primary: '',
      secondary: '',
      accent: '',
      info: '',
      success: '',
      warning: '',
      error: ''
    },
    logo: {
      mini: '',
      small: '',
      big: '',
      background: ''
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
