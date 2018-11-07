'use strict'
import initVueAuthenticate from '../services/auth'

let vueAuthInstance

const state = {
  displayname: null,
  email: null,
  isAuthenticated: false
}

const actions = {
  login (context, payload) {
    if (vueAuthInstance !== undefined) {
      vueAuthInstance = initVueAuthenticate(context.rootState.config.auth)
    }
    payload = payload || {}
    return vueAuthInstance.login(payload.user, payload.requestOptions)
  },

  logout (context, payload) {
    if (vueAuthInstance !== undefined) {
      vueAuthInstance = initVueAuthenticate(context.rootState.config.auth)
    }
    payload = payload || {}
    return vueAuthInstance.logout(payload.requestOptions).then(function () {
      context.commit('SET_USER', {
        displayname: '',
        email: '',
        isAuthenticated: false
      })
    })
  },

  initAuth (context, payload) {
    if (vueAuthInstance !== undefined) {
      vueAuthInstance = initVueAuthenticate(context.rootState.config.auth)
    }
    if (context.getters.isAuthenticated) {
      this._vm.$client.loginWithBearer(vueAuthInstance.getToken()).then(res => {
        context.commit('SET_USER', {
          displayname: res['display-name'],
          email: Object.keys(res.email).length === 0 ? '' : res.email,
          isAuthenticated: true
        })
      })
    }
  },

  authenticate (context, payload) {
    if (vueAuthInstance !== undefined) {
      vueAuthInstance = initVueAuthenticate(context.rootState.config.auth)
    }
    payload = payload || {}
    return vueAuthInstance.authenticate(payload.provider, payload.userData, payload.requestOptions).then(() => {
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
  },
  isAuthenticated (state, payload) {
    state.isAuthenticated = payload.isAuthenticated
  }
}

const getters = {
  isAuthenticated: (state, getters, rootState) => {
    if (!vueAuthInstance) {
      vueAuthInstance = initVueAuthenticate(rootState.config.auth)
    }
    return vueAuthInstance.isAuthenticated()
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}
