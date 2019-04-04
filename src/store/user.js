'use strict'
import initVueAuthenticate from '../services/auth'
import router from '../router/'

let vueAuthInstance

const state = {
  token: '',
  id: '',
  displayname: null,
  email: null,
  isAuthenticated: false
}

const actions = {
  logout (context, payload = {}) {
    vueAuthInstance.logout(payload.requestOptions)
    // reset user to default state
    context.commit('SET_USER', state)
    // force redirect to login page after logout
    router.push({ name: 'login' })
  },
  initAuth (context, autoRedirect = false) {
    // if called from login, use available vue-authenticate instance; else re-init
    if (!vueAuthInstance) vueAuthInstance = initVueAuthenticate(context.rootState.config.auth)
    const token = vueAuthInstance.getToken()
    if (token) {
      vueAuthInstance.events().addAccessTokenExpired(function () {
        console.log('store/user.js - AccessToken Expired：', arguments)
        context.dispatch('logout')
      })
      vueAuthInstance.mgr.events.addAccessTokenExpiring(function () {
        console.log('AccessToken Expiring：', arguments)
        vueAuthInstance.mgr.signinSilent().then(() => {
          console.log('token refreshed ...')
        }).catch(error => {
          console.log('token failed ' + error)
        })
      })

      this._vm.$client.loginWithBearer(token).then(res => {
        context.commit('SET_USER', {
          id: res['id'],
          displayname: res['display-name'],
          email: !Object.keys(res.email).length ? '' : res.email,
          token,
          isAuthenticated: true
        })
        if (autoRedirect) router.push({ path: '/' })
      }).catch((e) => {
        console.error('logout forced! Seems that your token is invalid. Error:', e)
        context.dispatch('logout')
      })
    }
  },
  login (context, payload = { provider: 'oauth2' }) {
    // reset vue-authenticate
    vueAuthInstance = initVueAuthenticate(context.rootState.config.auth)
    vueAuthInstance.authenticate(payload.provider, {}, {}).then(() => {
      if (vueAuthInstance.isAuthenticated) {
        context.dispatch('initAuth')
      }
    })
  },
  callback (context) {
    if (!vueAuthInstance) vueAuthInstance = initVueAuthenticate(context.rootState.config.auth)
    vueAuthInstance.mgr.signinRedirectCallback().then(() => {
      context.dispatch('initAuth', true)
    })
  },
  signinSilentCallback (context) {
    if (!vueAuthInstance) vueAuthInstance = initVueAuthenticate(context.rootState.config.auth)
    vueAuthInstance.mgr.signinSilentCallback().then(() => {
      context.dispatch('initAuth')
    })
  }
}

const mutations = {
  SET_USER (state, user) {
    state.displayname = user.displayname
    state.id = user.id
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
