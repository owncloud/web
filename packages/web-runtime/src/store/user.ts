const getInitialState = () => ({
  capabilities: [],
  version: {},
  quota: null
})
const state = getInitialState()

const getters = {
  capabilities: (state) => state.capabilities,
  quota: (state) => state.quota
}

const mutations = {
  SET_CAPABILITIES(state, data) {
    state.capabilities = data.capabilities
    state.version = data.version
  },
  /**
   * Legacy for oC10, in OCIS quota sticks on the respective drive
   * @param state
   * @param quota
   * @constructor
   */
  SET_QUOTA(state, quota) {
    // Turn strings into ints
    quota.free = parseInt(quota.free)
    quota.relative = parseFloat(quota.relative)
    quota.used = parseInt(quota.used)
    quota.total = parseInt(quota.total)

    state.quota = quota
  }
}

const actions = {}

export default {
  state,
  actions,
  mutations,
  getters
}
