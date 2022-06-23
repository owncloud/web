import { setUser as sentrySetUser } from '@sentry/browser'

const state = {
  token: '',
  id: '',
  uuid: '',
  displayname: '',
  email: '',
  isAuthenticated: false,
  capabilities: [],
  version: {},
  groups: [],
  quota: null,
  language: null
}

const getters = {
  isAuthenticated: (state) => state.isAuthenticated,
  getToken: (state) => state.token,
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
    state.isAuthenticated = user.isAuthenticated
    state.token = user.token
    state.groups = user.groups
    state.language = user.language
    sentrySetUser({ username: user.id })
  },
  SET_CAPABILITIES(state, data) {
    state.capabilities = data.capabilities
    state.version = data.version
  },
  SET_ACCESS_TOKEN(state, accessToken) {
    state.token = accessToken
  },
  SET_QUOTA(state, quota) {
    // Turn strings into ints
    quota.free = parseInt(quota.free)
    quota.relative = parseFloat(quota.relative)
    quota.used = parseInt(quota.used)
    quota.total = parseInt(quota.total)

    state.quota = quota
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
