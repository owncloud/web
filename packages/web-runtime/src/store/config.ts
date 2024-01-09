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
  options: {
    contextHelpers: true,
    defaultExtension: 'files',
    openAppsInTab: false,
    editor: {
      autosaveEnabled: false,
      autosaveInterval: 120
    },
    // ugly hack to still have notifications but don't have
    // them blocking UI elements in acceptance/E2E tests
    topCenterNotifications: false,
    disablePreviews: false,
    displayResourcesLazy: true,
    hoverableQuickActions: false,
    sidebar: {
      shares: {
        showAllOnLoad: false
      }
    },
    previewFileMimeTypes: [],
    runningOnEos: false,
    cernFeatures: false,
    sharingRecipientsPerPage: 200,
    contextHelpersReadMore: true,
    openLinksWithDefaultApp: true,
    tokenStorageLocal: true,
    loginUrl: '',
    logoutUrl: '',
    disabledExtensions: [],
    userListRequiresFilter: false,
    embed: {
      enabled: false,
      target: 'resources',
      messagesOrigin: null,
      delegateAuthentication: false,
      delegateAuthenticationOrigin: null
    }
  }
}

const actions = {
  loadConfig({ commit }, config) {
    commit('LOAD_CONFIG', config)

    if (config.external_apps) {
      config.external_apps.forEach((externalApp) => {
        if (externalApp.config !== undefined) {
          commit(
            'LOAD_EXTENSION_CONFIG',
            { id: externalApp.id, config: externalApp.config },
            { root: true }
          )
        }
      })
    }
  }
}

const mutations = {
  LOAD_CONFIG(state, config) {
    state.server = config.server?.endsWith('/') ? config.server : config.server + '/'
    state.auth = config.auth
    state.openIdConnect = config.openIdConnect
    state.state = config.state === undefined ? 'working' : config.state
    state.applications = config.applications === undefined ? [] : config.applications
    if (config.options !== undefined) {
      // Merge default options and provided options. Config options take precedence over defaults.
      state.options = { ...state.options, ...config.options }
    }
    if (config.corrupted) {
      state.corrupted = config.corrupted
    }
  }
}

const getters = {
  configuration: (state) => {
    return state
  },
  previewFileMimeTypes: (state) => {
    const mimeTypes = state.options.previewFileMimeTypes
    return (Array.isArray(mimeTypes) ? mimeTypes : [])
      .filter(Boolean)
      .map((ext) => ext.toLowerCase())
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}
