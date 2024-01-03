const getInitialState = () => ({
  capabilities: [],
  version: {}
})
const state = getInitialState()

const getters = {
  capabilities: (state) => state.capabilities
}

const mutations = {
  SET_CAPABILITIES(state, data) {
    state.capabilities = data.capabilities
    state.version = data.version
  }
}

const actions = {}

export default {
  state,
  actions,
  mutations,
  getters
}
