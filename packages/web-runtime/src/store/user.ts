import { setUser as sentrySetUser } from '@sentry/browser'

const state = {
  id: '',
  uuid: '',
  displayname: '',
  email: '',
  capabilities: [],
  version: {},
  groups: [],
  quota: null,
  language: null,
  usertype: '',
  role: null,
  roles: []
}

const getters = {
  /**
   * The `getToken` getter is deprecated. Please use getters['runtime/auth/accessToken'] instead.
   *
   * @param state
   * @param getters
   * @param rootState
   * @param rootGetters
   */
  getToken: (state, getters, rootState, rootGetters) => rootGetters['runtime/auth/accessToken'],
  capabilities: (state) => state.capabilities,
  quota: (state) => state.quota,
  user: (state) => state
}

const mutations = {
  SET_USER(state, user) {
    let email
    if (Object.keys(user.email).length === 0) {
      email = ''
    } else {
      email = user.email
    }
    state.displayname = user.displayname
    state.id = user.id
    state.uuid = user.uuid
    state.username = user.username
    state.email = email
    state.groups = user.groups
    state.language = user.language
    state.role = user.role
    state.usertype = user.usertype
    sentrySetUser({ username: user.id })
  },
  SET_CAPABILITIES(state, data) {
    state.capabilities = data.capabilities
    state.version = data.version
  },
  SET_QUOTA(state, quota) {
    // Turn strings into ints
    quota.free = parseInt(quota.free)
    quota.relative = parseFloat(quota.relative)
    quota.used = parseInt(quota.used)
    quota.total = parseInt(quota.total)

    state.quota = quota
  },
  SET_ROLES(state, roles) {
    state.roles = roles
  }
}

const actions = {
  resetUserState(context) {
    if (context.state.id === '') {
      return
    }
    // reset user
    this.reset({ self: false, nested: false, modules: { user: { self: true } } })
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}
