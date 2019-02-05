const namespaced = true

const state = {
  touched: null,
  text: null
}

const actions = {
  touched ({ commit }, flag) {
    commit('TOUCHED', flag)
  },
  updateText ({ commit }, text) {
    commit('UPDATE_TEXT', text)
  }
}

const mutations = {
  TOUCHED (state, flag) {
    state.touched = flag
  },
  UPDATE_TEXT (state, text) {
    state.text = text
  }
}

const getters = {
  isTouched: state => {
    return state.touched
  },
  currentContent: state => {
    return state.text
  }
}

export default {
  namespaced,
  state,
  actions,
  mutations,
  getters
}
