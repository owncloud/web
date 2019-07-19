import initVueAuthenticate from '../services/auth'
import router from '../router/'

let vueAuthInstance

const state = {
  token: '',
  id: '',
  displayname: null,
  email: null,
  isAuthenticated: false,
  capabilities: [],
  version: []
}

const actions = {
  logout (context, payload = {}) {
    const logoutFinalizer = () => {
      // reset user to default state
      context.commit('SET_USER', state)
      // reset capabilities to default state
      context.commit('SET_CAPABILITIES', { capabilities: null, version: null })
      // force redirect to login page after logout
      router.push({ name: 'login' })
    }
    vueAuthInstance.logout(payload.requestOptions)
      .then(logoutFinalizer)
      .catch(error => {
        console.error(error)
        logoutFinalizer()
      })
  },
  initAuth (context, autoRedirect = false) {
    // if called from login, use available vue-authenticate instance; else re-init
    if (!vueAuthInstance) vueAuthInstance = initVueAuthenticate(context.rootState.config)
    const token = vueAuthInstance.getToken()
    if (token) {
      vueAuthInstance.events().addAccessTokenExpired(function () {
        console.log('store/user.js - AccessToken Expired：', arguments)
        context.dispatch('logout')
      })
      vueAuthInstance.mgr.events.addAccessTokenExpiring(function () {
        console.log('AccessToken Expiring：', arguments)
        vueAuthInstance.mgr.signinSilent().then(() => {
          console.log('token refreshed…')
        }).catch(error => {
          console.log('token failed ' + error)
        })
      })

      const instance = context.rootState.config.server || window.location.origin
      const options = {
        baseUrl: instance,
        auth: {
          bearer: token
        }
      }
      if (context.state.id) {
        options.userInfo = {
          id: context.state.id,
          'display-name': context.state.displayname,
          email: context.state.email
        }
      }

      this._vm.$client.init(options)
      return this._vm.$client.login().then(res => {
        this._vm.$client.getCapabilities()
          .then(cap => {
            context.commit('SET_CAPABILITIES', cap)
            context.commit('SET_USER', {
              id: res['id'],
              displayname: res['display-name'],
              email: !Object.keys(res.email).length ? '' : res.email,
              token,
              isAuthenticated: true
            })
            if (autoRedirect) router.push({ path: '/' })
          })
      }).catch((e) => {
        console.error('logout forced! Seems that your token is invalid. Error:', e)
        context.dispatch('logout')
      })
    }
  },
  login (context, payload = { provider: 'oauth2' }) {
    // reset vue-authenticate
    vueAuthInstance = initVueAuthenticate(context.rootState.config)
    vueAuthInstance.authenticate(payload.provider, {}, {}).then(() => {
      if (vueAuthInstance.isAuthenticated) {
        context.dispatch('initAuth')
      }
    })
  },
  callback (context) {
    if (!vueAuthInstance) vueAuthInstance = initVueAuthenticate(context.rootState.config)
    vueAuthInstance.mgr.signinRedirectCallback().then(() => {
      context.dispatch('initAuth', true)
    }).catch(() => {
      context.dispatch('login')
    })
  },
  signinSilentCallback (context) {
    if (!vueAuthInstance) vueAuthInstance = initVueAuthenticate(context.rootState.config)
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
  },
  SET_CAPABILITIES (state, data) {
    state.capabilities = data.capabilities
    state.version = data.version
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
  },
  capabilities: (state) => {
    return state.capabilities
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}
