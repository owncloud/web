const state = {
  sidebarFooterContentComponent: null
}

const mutations = {
  SET_SIDEBAR_FOOTER_CONTENT_COMPONENT(state, component) {
    state.sidebarFooterContentComponent = component
  }
}

export default {
  state,
  mutations
}
