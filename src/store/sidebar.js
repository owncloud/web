const state = {
  navigationHidden: false,
  mainContentComponent: null,
  sidebarFooterContentComponent: null
}

const mutations = {
  SET_NAVIGATION_HIDDEN(state, hidden) {
    state.navigationHidden = hidden
  },

  SET_MAIN_CONTENT_COMPONENT(state, component) {
    state.mainContentComponent = component
  },

  SET_SIDEBAR_FOOTER_CONTENT_COMPONENT(state, component) {
    state.sidebarFooterContentComponent = component
  }
}

export default {
  state,
  mutations
}
