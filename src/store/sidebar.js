const state = {
  mainContentComponent: null
}

const mutations = {
  SET_MAIN_CONTENT_COMPONENT(state, component) {
    state.mainContentComponent = component
  }
}

export default {
  state,
  mutations
}
