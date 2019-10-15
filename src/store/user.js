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
    if (context.state.id === '') {
      return
    }
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
  initAuth (context, payload = { autoRedirect: false }) {
    function init (client, token, doLogin = true) {
      const options = context.getters.getClientOptions
      client.init(options)
      if (doLogin) {
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
              })
            })
        }).catch((e) => {
          console.warn('Seems that your token is invalid. Error:', e)
          context.dispatch('cleanUpLoginState')
          router.push({ name: 'accessDenied' })
        })
      } else {
        context.commit('UPDATE_TOKEN', token)
      }
    }

    // if called from login, use available vue-authenticate instance; else re-init
    if (!vueAuthInstance) {
      vueAuthInstance = initVueAuthenticate(context.rootState.config)
      const client = this._vm.$client
      vueAuthInstance.events().addAccessTokenExpired(function () {
        console.log('AccessToken Expired：', arguments)
      })
      vueAuthInstance.mgr.events.addAccessTokenExpiring(function () {
        console.log('AccessToken Expiring：', arguments)
      })
      vueAuthInstance.events().addUserLoaded(user => {
        console.log(`New User Loaded. access_token： ${user.access_token}, refresh_token: ${user.refresh_token}`)
        init(client, user.access_token, false)
      })
      vueAuthInstance.events().addUserUnloaded(() => {
        console.log('user unloaded…')
        context.dispatch('cleanUpLoginState')
        router.push({ name: 'accessDenied' })
      })
      vueAuthInstance.events().addSilentRenewError(error => {
        console.error('Silent Renew Error：', error)
        context.dispatch('cleanUpLoginState')
        router.push({ name: 'accessDenied' })
      })
    }
    const token = vueAuthInstance.getToken()
    if (token) {
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
      const autoRedirect = true
      context.dispatch('initAuth', { autoRedirect })
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
  },
  UPDATE_TOKEN (state, token) {
    state.token = token
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
  },
  getClientOptions: (state, getters, rootState) => {
    const instance = rootState.config.server || window.location.origin
    const options = {
      baseUrl: instance,
      auth: {
        bearer: state.token
      },
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
    if (state.id) {
      options.userInfo = {
        id: state.id,
        'display-name': state.displayname,
        email: state.email
      }
    }

    return options
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}
