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
  cleanUpLoginState (context) {
    // reset user to default state
    context.commit('SET_USER', state)
    // reset capabilities to default state
    context.commit('SET_CAPABILITIES', { capabilities: null, version: null })
    // clear oidc client state
    vueAuthInstance.clearLoginState()
  },
  logout (context) {
    const logoutFinalizer = () => {
      context.dispatch('cleanUpLoginState')
      // force redirect to login page after logout
      router.push({ name: 'login' })
    }
    vueAuthInstance.logout()
      .then(logoutFinalizer)
      .catch(error => {
        console.error(error)
        logoutFinalizer()
      })
  },
  initAuth (context, payload = { autoRedirect: false, privateLinkItemId: null }) {
    // if called from login, use available vue-authenticate instance; else re-init
    if (!vueAuthInstance) vueAuthInstance = initVueAuthenticate(context.rootState.config)
    const token = vueAuthInstance.getToken()

    function init (client, token) {
      const instance = context.rootState.config.server || window.location.origin
      const options = {
        baseUrl: instance,
        auth: {
          bearer: token
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
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
            client.users.getUserGroups(res.id).then(groups => {
              context.commit('SET_CAPABILITIES', cap)
              context.commit('SET_USER', {
                id: res.id,
                displayname: res['display-name'],
                email: !Object.keys(res.email).length ? '' : res.email,
                token,
                isAuthenticated: true,
                groups: groups
              })

              if (payload.autoRedirect) {
                router.push({ path: '/' })
              }

              if (payload.privateLinkItemId) {
                router.push({ name: 'private-link', params: { fileId: payload.privateLinkItemId } }).finally(() => {
                  // Remove private link item id from store to prevent load of it in the next authorisation
                  context.dispatch('setPrivateLinkItemId', null, { root: true })
                })
              }
            })
          })
      }).catch((e) => {
        console.warn('Seems that your token is invalid. Error:', e)
        context.dispatch('cleanUpLoginState')
        router.push({ name: 'accessDenied' })
      })
    }

    const tokenRefresh = function (client) {
      vueAuthInstance.mgr.signinSilent().then(user => {
        console.log('token refreshed…')
        init(client, user.access_token)
      }).catch(error => {
        console.warn('token refresh failed ' + error)
        context.dispatch('cleanUpLoginState')
        router.push({ name: 'accessDenied' })
      })
    }

    if (token) {
      const client = this._vm.$client
      vueAuthInstance.events().addAccessTokenExpired(function () {
        console.log('store/user.js - AccessToken Expired：', arguments)
        tokenRefresh(client)
      })
      vueAuthInstance.mgr.events.addAccessTokenExpiring(function () {
        console.log('AccessToken Expiring：', arguments)
        tokenRefresh(client)
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
      let autoRedirect = true
      const privateLinkItemId = context.rootGetters.privateLinkItemId

      if (privateLinkItemId) {
        autoRedirect = false
      }

      context.dispatch('initAuth', { autoRedirect, privateLinkItemId })
    }).catch((e) => {
      console.warn('error in OpenIdConnect:', e)
      context.dispatch('cleanUpLoginState')
      router.push({ name: 'accessDenied' })
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
