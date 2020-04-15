const merge = require('deepmerge')

const state = {
  file: {
    path: '',
    edit: false
  },
  extensions: {},
  newFileHandlers: [],
  fileSideBars: [],
  customFilesListIndicators: [],
  meta: {}
}

const actions = {
  // TODO move to app scope!
  /**
   * Open a file via webdav
   * @param {object} payload - filePath & client reference
   */
  openFile(context, payload) {
    return new Promise((resolve, reject) => {
      // TODO fix js-owncloud-client & change payload to filePath
      const filePath = payload.filePath
      context.commit('FETCH_FILE', filePath)
      // TODO fix js-owncloud-client & use global client
      const client = payload.client || false
      if (client) {
        client.files
          .getFileContents(filePath)
          .then(resolve)
          .catch(reject)
      } else {
        // if no client is given, implicit resolve without fetching the file...
        // useful for images
        resolve()
      }
    })
  },
  registerApp({ commit }, app) {
    commit('REGISTER_APP', app)
  },
  addFileAction({ commit }, action) {
    commit('ADD_FILE_ACTION', action)
  },

  /**
   * Load config for external app
   * @param {Object} app      AppInfo containing information about app and local config
   * @param {Object} config   Config from config.json which can overwrite local config from AppInfo
   */
  loadExternalAppConfig({ dispatch }, { app, config }) {
    config.external_apps.map(extension => {
      // Check if app is loaded from external server
      // Extension id = id from external apps array
      // App id = id specified in AppInfo
      if (extension.id === app.id && (app.config || extension.config)) {
        if (app.config && extension.config) {
          dispatch(`${app.name}/loadConfig`, merge(app.config, extension.config), { root: true })
          return
        }

        if (app.config) {
          dispatch(`${app.name}/loadConfig`, app.config, { root: true })
          return
        }

        if (extension.config) {
          dispatch(`${app.name}/loadConfig`, extension.config, { root: true })
        }
      }
    })
  }
}

const mutations = {
  REGISTER_APP(state, appInfo) {
    if (appInfo.fileActions) {
      appInfo.fileActions.forEach(a => {
        a.extensions.forEach(e => {
          const action = {
            version: 3,
            url: a.url,
            icon: a.icon,
            title: a.title
          }
          if (!state.extensions[e]) {
            state.extensions[e] = [action]
          } else {
            state.extensions[e].push(action)
          }
        })
      })
    }
    if (appInfo.extensions) {
      appInfo.extensions.forEach(e => {
        const link = {
          app: appInfo.id,
          icon: e.icon,
          newTab: e.newTab || false,
          routeName: e.routeName || appInfo.id,
          newFileMenu: e.newFileMenu || null
        }
        if (!state.extensions[e.extension]) {
          state.extensions[e.extension] = [link]
        } else {
          state.extensions[e.extension].push(link)
        }
        if (e.newFileMenu) {
          e.newFileMenu.ext = e.extension
          e.newFileMenu.action = link
          state.newFileHandlers.push(e.newFileMenu)
        }
      })
    }
    if (appInfo.fileSideBars) {
      // Merge in file side bars into global list
      // Reassign object in whole so that it updates the state properly
      const list = state.fileSideBars
      appInfo.fileSideBars.forEach(sideBar => {
        list.push(sideBar)
      })
      state.fileSideBars = list
    }

    if (appInfo.filesListIndicators) {
      const indicators = state.customFilesListIndicators
      appInfo.filesListIndicators.forEach(indicator => {
        indicators.push(indicator)
      })
      state.customFilesListIndicators = indicators
    }

    if (!appInfo.id) return
    // name: use id as fallback display name
    // icon: use empty box as fallback icon
    const app = {
      name: appInfo.name || appInfo.id,
      id: appInfo.id,
      icon: appInfo.icon || 'check_box_outline_blank'
    }
    state.meta[app.id] = app
  },
  FETCH_FILE(state, filePath) {
    state.file.path = filePath
  }
}

const getters = {
  apps: state => {
    return state.meta
  },
  activeFile: state => {
    return state.file
  },
  newFileHandlers: state => {
    return state.newFileHandlers
  },
  extensions: state => {
    return fileExtension => {
      const ext = state.extensions[fileExtension]
      if (!ext) {
        return []
      }
      ext.map(e => {
        if (e.version === 3) {
          return e
        }
        // enhance App Chooser with App Name as label
        e.name = state.meta[e.app].name
        // if no icon for this filetype extension, choose the app icon
        if (!e.icon) e.icon = state.meta[e.app].icon
        return e
      })
      return ext
    }
  },
  fileSideBars: state => {
    return state.fileSideBars
  },
  customFilesListIndicators: state => state.customFilesListIndicators
}

export default {
  state,
  actions,
  mutations,
  getters
}
