const state = {
  state: null,
  server: '',
  // auth is the legacy configuration
  auth: {
    clientId: '',
    apiUrl: '',
    authUrl: '',
    metaDataUrl: ''
  },
  // to be used from now on
  openIdConnect: {
    authority: ''
  },
  rootFolder: '',
  theme: {
    name: 'owncloud',
    general: {
      name: '',
      slogan: '',
      helpDeskText: '',
      helpDeskLink: '',
      helpDeskLinkText: 'ownCloud Central'
    },
    logo: {
      sidebar: '',
      favicon: '',
      login: ''
    },
    filesList: {
      hideDefaultStatusIndicators: false
    },
    loginPage: {
      autoRedirect: true,
      backgroundImg: ''
    }
  },
  options: {
    hideSearchBar: false
  }
}

const actions = {
  loadConfig({ commit }, config) {
    commit('LOAD_CONFIG', config)

    if (config.external_apps) {
      config.external_apps.forEach(externalApp => {
        if (externalApp.config !== undefined) {
          commit(
            'LOAD_EXTENSION_CONFIG',
            { id: externalApp.id, config: externalApp.config },
            { root: true }
          )
        }
      })
    }
  },
  loadTheme(context, { theme, name }) {
    theme.name = name
    context.commit('LOAD_THEME', theme)
  }
}

const mutations = {
  LOAD_CONFIG(state, config) {
    state.server = config.server
    state.auth = config.auth
    state.openIdConnect = config.openIdConnect
    state.rootFolder = config.rootFolder === undefined ? '/' : config.rootFolder
    state.uploadChunkSize = config.uploadChunkSize === undefined ? Infinity : config.uploadChunkSize
    state.state = config.state === undefined ? 'working' : config.state
    state.applications = config.applications === undefined ? [] : config.applications
    if (config.options !== undefined) {
      // Merge default options and provided options. Config options take precedence over defaults.
      state.options = { ...state.options, ...config.options }
    }
    if (config.corrupted) {
      state.corrupted = config.corrupted
    }
  },
  LOAD_THEME(state, theme) {
    state.theme = { ...state.theme, ...theme }
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
