'use strict'

import {
  forEach,
  map
} from 'lodash'

const state = {
  file: {
    path: '',
    edit: false
  },
  extensions: {},
  fileSideBars: {},
  meta: {},
  topBars: {}
}

const actions = {
  // TODO move to app scope!
  /**
   * Open a file via webdav
   * @param {object} payload - filePath & client reference
   */
  openFile (context, payload) {
    return new Promise((resolve, reject) => {
      // TODO fix js-owncloud-client & change payload to filePath
      let filePath = payload.filePath
      context.commit('FETCH_FILE', filePath)
      // TODO fix js-owncloud-client & use global client
      let client = payload.client || false
      if (client) {
        client.files.getFileContents(filePath).then(resolve).catch(reject)
      } else {
        // if no client is given, implicit resolve without fetching the file...
        // useful for images
        resolve()
      }
    })
  },
  registerApp ({ commit }, app) {
    commit('REGISTER_APP', app)
  }
}

const mutations = {
  REGISTER_APP (state, appInfo) {
    if (appInfo.extensions) {
      forEach(appInfo.extensions, (e) => {
        let link = {
          app: appInfo.id,
          icon: e.icon
        }
        if (!state.extensions[e.extension]) {
          state.extensions[e.extension] = [link]
        } else {
          state.extensions[e.extension].push(link)
        }
      })
    }
    if (appInfo.fileSideBars) {
      forEach(appInfo.fileSideBars, (sideBar) => {
        state.fileSideBars[sideBar.app] = sideBar
      })
    }
    if (appInfo.topBar) {
      forEach(appInfo.topBar, (topBar) => {
        state.topBars[topBar.app] = topBar
      })
    }
    if (!appInfo.id) return
    if (!appInfo.id) return
    // name: use id as fallback display name
    // icon: use empty box as fallback icon
    let app = {
      name: appInfo.name || appInfo.id,
      id: appInfo.id,
      icon: appInfo.icon || 'check_box_outline_blank'
    }
    state.meta[app.id] = app
  },
  FETCH_FILE (state, filePath) {
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
  activeApp: (state, getters, rootState) => {
    if (rootState.route && rootState.route.path) return state.meta[rootState.route.path.split('/')[1]]
  },
  extensions: state => {
    if (!state.file.path) return []
    // TODO regex optimization, if everything works.
    let activeExtension = state.file.path.match(/\.[0-9a-z]+$/i)[0].substr(1)
    // console.log('MARLIN',  state.file.path, ' has ending ', activeExtension)
    let ext = state.extensions[activeExtension]
    map(ext, (e) => {
      // enhance App Chooser with App Name as label
      e.name = state.meta[e.app].name
      // if no icon for this filetype extension, choose the app icon
      if (!e.icon) e.icon = state.meta[e.app].icon
      return e
    })
    return ext
  },
  fileSideBars: state => {
    return state.fileSideBars
  },
  navTopBars: state => {
    return state.topBars
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}
