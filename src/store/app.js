'use strict'

const state = {
  sidebarVisible: false
}

const actions = {
  toggleSidebar (context, visible) {
    context.commit('TOGGLE_SIDEBAR', visible)
  }
}

const mutations = {
  TOGGLE_SIDEBAR (state, visible) {
    state.sidebarVisible = visible
  }
}

const getters = {
  isSidebarVisible: state => {
    return state.sidebarVisible
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}
