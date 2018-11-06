import {
  initVueAuthenticate
} from '../services/auth.js'

let vueAuthInstance

export default {
  state: {
    user: {
      displayname: '',
      email: 'x'
    }
  },
  getters: {
    isAuthenticated: (state, getters, rootState) => {
      if (!vueAuthInstance) {
        vueAuthInstance = initVueAuthenticate(rootState.config.auth)
      }
      return vueAuthInstance.isAuthenticated()
    }
  },
  mutations: {
    SET_USER (state, payload) {
      state.user = payload
    }
  },

  actions: {
    login (context, payload) {
      payload = payload || {}
      return vueAuthInstance.login(payload.user, payload.requestOptions)
    },

    logout (context, payload) {
      payload = payload || {}
      return vueAuthInstance.logout(payload.requestOptions).then(function () {
        context.commit('SET_USER', {
          displayname: '',
          email: ''
        })
      })
    },

    initAuth (context, payload) {
      if (context.getters.isAuthenticated) {
        this._vm.$client.loginWithBearer(vueAuthInstance.getToken()).then(res => {
          context.commit('SET_USER', {
            displayname: res['display-name'],
            email: Object.keys(res.email).length === 0 ? '' : res.email
          })
        })
      }
    },

    authenticate (context, payload) {
      if (!vueAuthInstance) {
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
}
