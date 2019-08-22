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
  version: [],
  groups: []
}

const actions = {
  logout (context, autoRedirect = false) {
    const logoutFinalizer = () => {
      // reset user to default state
      context.commit('SET_USER', state)
      // reset capabilities to default state
      context.commit('SET_CAPABILITIES', { capabilities: null, version: null })
      // force redirect to login page after logout
      if (autoRedirect) {
        router.push({ name: 'access-denied' })
      } else {
        router.push({ name: 'login' })
      }
    }
    vueAuthInstance.logout()
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

    function init (client, token) {
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

      client.init(options)
      return client.login().then(res => {
        return client.getCapabilities()
          .then(cap => {
            client.users.getUserGroups(res['id']).then(groups => {
              context.commit('SET_CAPABILITIES', cap)
              context.commit('SET_USER', {
                id: res['id'],
                displayname: res['display-name'],
                email: !Object.keys(res.email).length ? '' : res.email,
                token,
                isAuthenticated: true,
                groups: groups
              })
              if (autoRedirect) {
                router.push({ path: '/' })
              }
            })
          })
      }).catch((e) => {
        console.error('logout forced! Seems that your token is invalid. Error:', e)
        context.dispatch('logout', autoRedirect)
      })
    }

    if (token) {
      vueAuthInstance.events().addAccessTokenExpired(function () {
        console.log('store/user.js - AccessToken Expired：', arguments)
        context.dispatch('logout')
      })
      const client = this._vm.$client
      vueAuthInstance.mgr.events.addAccessTokenExpiring(function () {
        console.log('AccessToken Expiring：', arguments)
        vueAuthInstance.mgr.signinSilent().then(user => {
          console.log('token refreshed…')
          init(client, user.access_token)
        }).catch(error => {
          console.log('token failed ' + error)
        })
      })

      init(this._vm.$client, token)
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
    state.groups = user.groups
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
