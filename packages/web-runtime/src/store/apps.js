const state = {
  file: {
    path: '',
    edit: false
  },
  fileEditors: [],
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
  }
}

const mutations = {
  REGISTER_APP(state, appInfo) {
    if (appInfo.extensions) {
      appInfo.extensions.forEach(e => {
        const editor = {
          app: appInfo.id,
          icon: e.icon,
          newTab: e.newTab || false,
          routeName: e.routeName,
          routes: e.routes || [],
          extension: e.extension,
          handler: e.handler
        }

        state.fileEditors.push(editor)

        if (e.newFileMenu) {
          e.newFileMenu.ext = e.extension
          e.newFileMenu.action = editor
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
  },

  LOAD_EXTENSION_CONFIG(state, { id, config }) {
    // make available in editors
    const editors = [...state.fileEditors]
    for (const editor of editors) {
      if (editor.app === id) {
        editor.config = config
      }
    }
    state.fileEditors = editors

    // make available in meta
    if (state.meta[id]) {
      const meta = { ...state.meta }
      meta[id].config = config
      state.meta = meta
    }
  }
}

const getters = {
  appIds: state => {
    return Object.keys(state.meta)
  },
  apps: state => {
    return state.meta
  },
  activeFile: state => {
    return state.file
  },
  newFileHandlers: state => {
    return state.newFileHandlers
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
