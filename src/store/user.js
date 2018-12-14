'use strict'
import initVueAuthenticate from '../services/auth'
import router from '../router/'

let vueAuthInstance

const state = {
  token: '',
  displayname: null,
  email: null,
  isAuthenticated: false
}

const actions = {
  logout (context, payload = {}) {
    return vueAuthInstance.logout(payload.requestOptions).then(function () {
      // reset user to default state
      context.commit('SET_USER', state)
      // force redirect to login page after logout
      router.push({ name: 'login' })
    })
  },
  initAuth (context) {
    // if called from login, use available vue-authenticate instance; else re-init
    if (!vueAuthInstance) vueAuthInstance = initVueAuthenticate(context.rootState.config.auth)
    const token = vueAuthInstance.getToken()
    this._vm.$client.loginWithBearer(token).then(res => {
      const token = vueAuthInstance.getToken()
      context.commit('SET_USER', {
        displayname: res['display-name'],
        email: !Object.keys(res.email).length ? '' : res.email,
        token,
        isAuthenticated: true
      })
      router.push({ path: '/' })
    }).catch((e) => {
      console.error('logout forced! Seems that your token is invalid. Error:', e)
      context.dispatch('logout')
    })
  },
  login (context, payload = { provider: 'oauth2' }) {
    // reset vue-authenticate
    vueAuthInstance = initVueAuthenticate(context.rootState.config.auth)
    vueAuthInstance.authenticate(payload.provider, {}, {}).then(() => {
      if (vueAuthInstance.isAuthenticated) {
        context.dispatch('initAuth')
      }
    })
  }
}

const mutations = {
  SET_USER (state, user) {
    state.displayname = user.displayname
    state.email = user.email
    state.isAuthenticated = user.isAuthenticated
    state.token = user.token
  }
}

const getters = {
  isAuthenticated: (state) => {
    return state.isAuthenticated
  },
  getToken: (state) => {
    return state.token
  },
  user: (state) => {
    return state
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}
