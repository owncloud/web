'use strict'

const state = {
  auth: {
    clientId: null,
    apiUrl: null,
    authUrl: null
  },
  theme: {
    general: {
      name: "ownCloud",
      slogan: "ownCloud – A safe home for all your data"
    },
    colors: {
      primary: "#467391",
      secondary: "#8C9EFF",
      accent: "#F5F7F9",
      info: "#6A9EFF",
      success: "#32D296",
      warning: "#FAA05A",
      error: "#F0506E"
    },
    logo: {
      mini: "core/gfx/cloud-logo-invert.svg",
      small: "core/gfx/cloud-logo-invert.svg",
      big: "core/gfx/cloud-logo-invert.svg"
    }
  }
}

const actions = {
  loadConfig (context, config) {
    context.commit('LOAD_CONFIG', config)
  },
  loadTheme (context, theme) {
    console.log(theme)
    context.commit('LOAD_THEME', theme)
  }
}

const mutations = {
  LOAD_CONFIG (state, config) {
    state.auth = config.auth
  },
  LOAD_THEME (state, theme) {

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
