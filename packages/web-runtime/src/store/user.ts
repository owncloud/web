import get from 'lodash-es/get'
import isEmpty from 'lodash-es/isEmpty'
import { UserManager } from '../services/auth'
import { router } from '../router'
import { clientService } from 'web-pkg/src/services'

import { setUser as sentrySetUser } from '@sentry/browser'

let userManager: UserManager

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
  userReady: false,
  quota: null,
  language: null
}

const actions = {
  cleanUpLoginState(context) {
    if (context.state.id === '') {
      return
    }
    // reset user
    this.reset({ self: false, nested: false, modules: { user: { self: true } } })

    // clear dynamic navItems
    return context.dispatch('clearDynamicNavItems')
  },
  async logout({ dispatch }) {
    await Promise.all([
      dispatch('cleanUpLoginState'),
      dispatch('hideModal'),
      dispatch('clearSettingsValues')
    ])

    const u = userManager.getStoredUserObject()
    if (u && u.id_token) {
      return userManager.signoutRedirect({ id_token_hint: u.id_token })
    } else {
      await userManager.removeUser()
    }
  },
  async initAuth(context, payload = { autoRedirect: false }) {
    const init = async (sdkClient, token, fetchUserInfo = true) => {
      const serverUrl = context.rootState.config.server || window.location.origin
      const options = {
        baseUrl: serverUrl,
        auth: {
          bearer: token
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      }
      if (context.state.id) {
        ;(options as any).userInfo = {
          id: context.state.id,
          'display-name': context.state.displayname,
          email: context.state.email
        }
      }

      sdkClient.init(options)
      if (fetchUserInfo) {
        let login
        try {
          login = await sdkClient.login()
        } catch (e) {
          console.warn('Seems that your token is invalid. Error:', e)
          await context.dispatch('cleanUpLoginState')
          await router.replace({ name: 'accessDenied' })
          return
        }

        const userGroups = await sdkClient.users.getUserGroups(login.id)
        const user = await sdkClient.users.getUser(login.id)

        // FIXME: Can be removed as soon as the uuid is integrated in the OCS api
        // see https://github.com/owncloud/ocis/issues/3271
        let graphUser
        if (context.state.capabilities.spaces?.enabled) {
          const graphClient = clientService.graphAuthenticated(serverUrl, token)
          graphUser = await graphClient.users.getMe()
        }

        let userEmail = ''
        if (login && login.email) {
          userEmail = login.email
        } else if (user && user.email) {
          userEmail = user.email
        }

        const language = user?.language

        context.commit('SET_USER', {
          id: login.id,
          uuid: graphUser?.data?.id || '',
          username: login.username,
          displayname: login.displayname || login['display-name'],
          email: userEmail,
          token,
          isAuthenticated: true,
          groups: userGroups,
          language
        })

        if (user.quota.definition !== 'default' && user.quota.definition !== 'none') {
          context.commit('SET_QUOTA', user.quota)
        }
        await context.dispatch('loadSettingsValues')
        if (payload.autoRedirect) {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          router.push({ path: '/' }).catch(() => {})
        }
      } else {
        context.commit('UPDATE_TOKEN', token)
      }

      await context.dispatch('loadCapabilities', { token })
      context.commit('SET_USER_READY', true)
    }
    // if called from login, use available vue-authenticate instance; else re-init
    if (!userManager) {
      userManager = new UserManager(context.rootState.config)
      userManager.events.addAccessTokenExpired((...args) => {
        console.log('AccessToken Expired：', ...args)
      })
      userManager.events.addAccessTokenExpiring((...args) => {
        console.log('AccessToken Expiring：', ...args)
      })
      userManager.events.addUserLoaded((user) => {
        console.log(
          `New User Loaded. access_token： ${user.access_token}, refresh_token: ${user.refresh_token}`
        )
        init(this._vm.$client, user.access_token, false)
      })
      userManager.events.addUserSignedIn(() => {
        console.log('user signed in')
      })
      userManager.events.addUserUnloaded(() => {
        console.log('user unloaded…')
        context.dispatch('cleanUpLoginState')

        // handle redirect after logout
        const configuration = context.getters.configuration
        if (configuration.auth) {
          if (configuration.auth.logoutUrl) {
            return (window.location = configuration.auth?.logoutUrl)
          } else if (configuration.server) {
            return (window.location = <any>`${configuration.server}/index.php/logout`)
          }
        }
        return router.push({ name: 'login' })
      })
      userManager.events.addSilentRenewError((error) => {
        console.error('Silent Renew Error：', error)
        context.dispatch('cleanUpLoginState')
        router.push({ name: 'accessDenied' })
      })
    }
    const accessToken = userManager.getAccessToken()
    if (accessToken) {
      await init(this._vm.$client, accessToken)
    }
  },
  login(context) {
    userManager = new UserManager(context.rootState.config)
    return userManager.signinRedirect()
  },
  callback(context) {
    if (!userManager) {
      userManager = new UserManager(context.rootState.config)
    }

    // craft a url that the parser in oidc-client-ts can handle …
    // oidc-client-ts > 2.0.4 should accept relative urls as well. Until we have that we prepend our current origin
    const url =
      window.location.origin +
      '/?' +
      new URLSearchParams(router.currentRoute.query as Record<string, string>).toString()

    userManager
      .signinRedirectCallback(url)
      .then(() => {
        context.dispatch('initAuth', { autoRedirect: true })
      })
      .catch((e) => {
        console.warn('error in OpenIdConnect:', e)
        context.dispatch('cleanUpLoginState')
        router.push({ name: 'accessDenied' })
      })
  },
  signinSilentCallback(context) {
    if (!userManager) {
      userManager = new UserManager(context.rootState.config)
    }
    userManager.signinSilentCallback().then(() => {
      context.dispatch('initAuth')
    })
  },
  async loadCapabilities(
    { commit, rootState, state },
    { token, publicToken, user, password, overwrite = false }
  ) {
    if (!isEmpty(state.capabilities) && !overwrite) {
      return
    }

    const endpoint = new URL(rootState.config.server || window.location.origin)
    endpoint.pathname = endpoint.pathname.replace(/\/$/, '') + '/ocs/v1.php/cloud/capabilities'
    endpoint.searchParams.append('format', 'json')

    const headers = {
      'X-Requested-With': 'XMLHttpRequest',
      ...(publicToken && { 'public-token': publicToken }),
      ...(user &&
        password && {
          Authorization: 'Basic ' + Buffer.from([user, password].join(':')).toString('base64')
        }),
      ...(token && {
        Authorization: 'Bearer ' + token
      })
    }

    const capabilitiesApiResponse = await fetch(endpoint.href, { headers })
    const capabilitiesApiResponseJson = await capabilitiesApiResponse.json()

    commit(
      'SET_CAPABILITIES',
      get(capabilitiesApiResponseJson, 'ocs.data', { capabilities: null, version: null })
    )
  }
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
  UPDATE_TOKEN(state, token) {
    state.token = token
  },
  SET_USER_READY(state, ready) {
    state.userReady = ready
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

const getters = {
  isAuthenticated: (state) => {
    return state.isAuthenticated
  },
  isUserReady: (state) => {
    return state.userReady
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

  quota: (state) => state.quota
}

export default {
  state,
  actions,
  mutations,
  getters
}
