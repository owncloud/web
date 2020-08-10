const state = {
  mainContentComponent: null,
  sidebarFooterContentComponent: null
}

const mutations = {
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
