import {
  initVueAuthenticate
} from '../services/auth.js'

let vueAuthInstance

export default {
  state: {
    user: {
      displayname: '',
      email: 'x'
    },
    isAuthenticated: false
  },
  getters: {
    isAuthenticated: state => {
      return state.isAuthenticated
    }
  },
  mutations: {
    IS_AUTHENTICATED (state, payload) {
      state.isAuthenticated = payload.isAuthenticated
    },
    SET_USER (state, payload) {
      state.user = payload
    }
  },

  actions: {
    login (context, payload) {
      payload = payload || {}
      return vueAuthInstance.login(payload.user, payload.requestOptions).then(function () {
        context.commit('IS_AUTHENTICATED', {
          isAuthenticated: vueAuthInstance.isAuthenticated()
        })
      })
    },

    logout (context, payload) {
      payload = payload || {}
      return vueAuthInstance.logout(payload.requestOptions).then(function () {
        context.commit('IS_AUTHENTICATED', {
          isAuthenticated: vueAuthInstance.isAuthenticated()
        })
        context.commit('SET_USER', {
          displayname: '',
          email: ''
        })
      })
    },

    initAuth (context, payload) {
      this._vm.$client.loginWithBearer(vueAuthInstance.getToken()).then(res => {
        context.commit('SET_USER', {
          displayname: res['display-name'],
          email: Object.keys(res.email).length === 0 ? '' : res.email
        })
      })
    },

    authenticate (context, payload) {
      // TODO shouldn't we use vue-authenticate global & inject it into vue ?
      vueAuthInstance = initVueAuthenticate(context.rootState.config.auth)
      payload = payload || {}
      return vueAuthInstance.authenticate(payload.provider, payload.userData, payload.requestOptions).then(() => {
        context.commit('IS_AUTHENTICATED', {
          isAuthenticated: vueAuthInstance.isAuthenticated()
        })
        if (vueAuthInstance.isAuthenticated) {
          context.dispatch('initAuth')
        }
      })
    }

  }
}
