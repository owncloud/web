const namespaced = true

const state = {
  touched: null,
  loading: false,
  currentETag: null,
  currentFile: '',
  lastError: null,
  text: null
}

const actions = {
  updateText({ commit }, text) {
    commit('TOUCHED', true)
    commit('UPDATE_TEXT', text)
  },
  clearLastError({ commit }) {
    commit('ERROR', '')
  },
  loadFile({ commit }, payload) {
    const filePath = payload.filePath
    const client = payload.client

    commit('LOADING', true)
    commit('CURRENT_FILE', filePath)
    client.files
      .getFileContents(filePath, { resolveWithResponseObject: true })
      .then(resp => {
        commit('CURRENT_ETAG', resp.headers.ETag)
        commit('UPDATE_TEXT', resp.body)
        commit('LOADING', false)
      })
      .catch(error => {
        commit('ERROR', error.message || error)
        commit('LOADING', false)
      })
  },
  saveFile({ commit, state }, payload) {
    commit('LOADING', true)
    payload.client.files
      .putFileContents(state.currentFile, state.text, {
        previousEntityTag: state.currentETag
      })
      .then(resp => {
        commit('CURRENT_ETAG', resp.ETag)

        // get etag & update
        commit('TOUCHED', false)
        commit('LOADING', false)
      })
      .catch(error => {
        commit('ERROR', error.message || error)
        commit('LOADING', false)
      })
  }
}

const mutations = {
  TOUCHED(state, flag) {
    state.touched = flag
  },
  LOADING(state, loading) {
    state.loading = loading
  },
  UPDATE_TEXT(state, text) {
    state.text = text
  },
  CURRENT_ETAG(state, etag) {
    state.currentETag = etag
  },
  CURRENT_FILE(state, filePath) {
    state.currentFile = filePath
  },
  ERROR(state, errorMessage) {
    state.lastError = errorMessage
  }
}

const getters = {
  isTouched: state => {
    return state.touched
  },
  isLoading: state => {
    return state.loading
  },
  currentContent: state => {
    return state.text
  },
  lastError: state => {
    return state.lastError
  }
}

export default {
  namespaced,
  state,
  actions,
  mutations,
  getters
}
